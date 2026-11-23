import { authToken } from '@/shared/api/auth-token';
import { downloadFuelings, queryFuelings } from './reports.api';
import { fuelingFixture } from './test-fixtures';

const fetchMock = vi.fn();
const query = { startDate: '2026-11-01', endDate: '2026-11-14' };
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  authToken.set('test-token');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('consulta JSON com Bearer, datas e um único prefixo /api', async () => {
  fetchMock.mockResolvedValue(Response.json(fuelingFixture));
  expect(await queryFuelings(query)).toEqual(fuelingFixture);
  const request = fetchMock.mock.calls[0]![0] as Request;
  const url = new URL(request.url);
  expect(url.pathname).toBe('/api/v1/reports/fuelings');
  expect(Object.fromEntries(url.searchParams)).toEqual(query);
  expect(request.headers.get('Authorization')).toBe('Bearer test-token');
  expect(request.cache).toBe('no-store');
});

it('não envia consulta sem sessão', async () => {
  authToken.clear();
  await expect(queryFuelings(query)).rejects.toMatchObject({ status: 401 });
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each([401, 403, 404, 400, 422, 500])(
  'trata HTTP %s sem transformar erro em dados',
  async (status) => {
    fetchMock.mockResolvedValue(Response.json({ detail: 'Detalhe do backend' }, { status }));
    await expect(queryFuelings(query)).rejects.toMatchObject({
      status,
      message: expect.stringContaining('Detalhe do backend'),
    });
  },
);

it('trata falha de rede', async () => {
  fetchMock.mockRejectedValue(new TypeError('offline'));
  await expect(queryFuelings(query)).rejects.toThrow(/conectar à API/);
});

it('rejeita HTML, JSON inválido e filtros divergentes', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response('<html/>', { headers: { 'Content-Type': 'text/html' } }),
  );
  await expect(queryFuelings(query)).rejects.toThrow(/Resposta incompatível/);
  fetchMock.mockResolvedValueOnce(Response.json({}));
  await expect(queryFuelings(query)).rejects.toThrow(/Dados incompatíveis/);
  fetchMock.mockResolvedValueOnce(
    Response.json({
      ...fuelingFixture,
      filters: { startDate: '2026-01-01', endDate: query.endDate },
    }),
  );
  await expect(queryFuelings(query)).rejects.toThrow(/filtros aplicados/);
});

it.each([
  ['pdf', 'application/pdf', 'pdf'],
  ['excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx'],
] as const)('baixa %s autenticado e libera a URL temporária', async (format, mime, extension) => {
  vi.useFakeTimers();
  const create = vi.fn<(blob: Blob) => string>(() => 'blob:test');
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    },
  );
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    expect(this.download).toBe(`abastecimentos.${extension}`);
    expect(this.href).toBe('blob:test');
  });
  fetchMock.mockResolvedValue(new Response('file-bytes', { headers: { 'Content-Type': mime } }));
  await downloadFuelings(query, format);
  const request = fetchMock.mock.calls[0]![0] as Request;
  expect(request.url).toContain(`/fuelings/${format}?`);
  expect(request.headers.get('Authorization')).toBe('Bearer test-token');
  expect(request.headers.get('Accept')).toContain(mime);
  expect(create.mock.calls[0]![0]).toBeInstanceOf(Blob);
  expect(click).toHaveBeenCalledOnce();
  expect(document.querySelector('a[download]')).toBeNull();
  await vi.runAllTimersAsync();
  expect(revoke).toHaveBeenCalledWith('blob:test');
});

it('não salva respostas de erro, MIME incorreto ou arquivo vazio', async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  fetchMock.mockResolvedValueOnce(Response.json({ detail: 'Sem acesso' }, { status: 403 }));
  await expect(downloadFuelings(query, 'pdf')).rejects.toMatchObject({ status: 403 });
  fetchMock.mockResolvedValueOnce(Response.json({ error: 'não é PDF' }));
  await expect(downloadFuelings(query, 'pdf')).rejects.toThrow(/Resposta incompatível/);
  fetchMock.mockResolvedValueOnce(
    new Response('', { headers: { 'Content-Type': 'application/pdf' } }),
  );
  await expect(downloadFuelings(query, 'pdf')).rejects.toThrow(/arquivo vazio/);
  expect(click).not.toHaveBeenCalled();
});

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { queryClient } from '@/app/providers/queryClient';
import { authToken } from '@/shared/api/auth-token';
import { fuelingFixture } from './test-fixtures';

vi.setConfig({ testTimeout: 20000 });

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', (request: Request) => {
    if (new URL(request.url).pathname === '/api/v1/auth/me') {
      return Promise.resolve(
        Response.json({
          id: 'reports-test',
          name: 'Admin',
          email: 'reports@example.test',
          role: 'ADMIN',
          permissions: ['FUELINGS_READ', 'TRIP_REQUESTS_READ', 'TRIPS_READ', 'SECTORS_READ'],
          sectorId: null,
        }),
      );
    }
    return fetchMock(request);
  });
  authToken.set('token');
});

it('consulta e exporta os oito painéis do Geral preservando a prévia quando o PDF falha', async () => {
  const user = await openFuelings();
  const sectorId = '50ddcc1c-d8f0-49e4-8881-d3786a7ad6fe';
  fetchMock.mockResolvedValueOnce(Response.json([{ id: sectorId, name: 'SVO de teste' }]));
  await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
  await user.selectOptions(screen.getByLabelText('Tipo'), 'general');
  expect(screen.queryByLabelText('Data inicial')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Período')).toHaveValue('today');
  await screen.findByRole('option', { name: 'SVO de teste' });
  await user.selectOptions(screen.getByLabelText('Setor'), sectorId);
  await user.selectOptions(screen.getByLabelText('Período'), 'week');
  const sections = [
    ['availability', 'Disponibilidade da frota'],
    ['triage', 'Triagem e alocação'],
    ['daily-requests', 'Solicitações por dia'],
    ['fleet-status', 'Frota por status'],
    ['ongoing-trips', 'Viagens em andamento'],
    ['vehicle-consumption', 'Consumo por veículo'],
    ['recent-fuelings', 'Abastecimentos recentes'],
    ['maintenance-alerts', 'Alertas de manutenção'],
  ].map(([indicator, title]) => ({
    indicator,
    title,
    context: 'Situação atual',
    columns: ['Dados'],
    rows: [['1']],
  }));
  const snapshotId = 'cd11d21c-21f1-4aa1-bb14-f6e1ae9434c0';
  fetchMock.mockResolvedValueOnce(
    Response.json({
      snapshotId,
      title: 'Relatório geral do SVO',
      referenceAt: '2026-11-19T12:00:00Z',
      referenceLabel: '19/11/2026 09:00:00 (São Paulo)',
      sections,
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  const preview = await screen.findByRole('region', { name: 'Relatório geral do SVO' });
  expect(
    within(preview)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent),
  ).toEqual(sections.map(({ title }) => title));
  const query = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
  expect(query.pathname).toBe('/api/v1/reports/svo/general');
  expect(query.searchParams.get('sectorId')).toBe(sectorId);
  expect(query.searchParams.get('period')).toBe('week');
  fetchMock.mockResolvedValueOnce(
    Response.json(
      { detail: 'Alertas de manutenção — O PDF não suporta o caractere U+6F22' },
      { status: 400 },
    ),
  );
  await user.click(screen.getByRole('button', { name: 'Gerar PDF' }));
  expect(await screen.findByText(/U\+6F22/)).toBeVisible();
  const download = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
  expect(download.pathname).toBe('/api/v1/reports/svo/general/pdf');
  expect(download.searchParams.get('snapshotId')).toBe(snapshotId);
  expect(preview).toBeVisible();
  await checkSvoOutput(user, 'general', snapshotId);
  expect(screen.getByRole('button', { name: 'Gerar Excel' })).toBeEnabled();
  await user.selectOptions(screen.getByLabelText('Período'), 'all');
  expect(preview).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Gerar Excel' })).toBeDisabled();
});

it.each([
  ['vehicle-consumption', 'Consumo por veículo', 'Sem registros de consumo.'],
  ['recent-fuelings', 'Abastecimentos recentes', 'Sem abastecimentos registrados.'],
  ['maintenance-alerts', 'Alertas de manutenção', 'Nenhum alerta de manutenção.'],
])('consulta %s sem filtros e diferencia vazio de falha', async (indicator, title, empty) => {
  const user = await openFuelings();
  await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
  await user.selectOptions(screen.getByLabelText('Relatório individual'), indicator);
  expect(screen.queryByLabelText('Data inicial')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Setor')).not.toBeInTheDocument();
  fetchMock.mockResolvedValueOnce(
    Response.json({
      snapshotId: 'cd11d21c-21f1-4aa1-bb14-f6e1ae9434c0',
      title,
      referenceAt: '2026-11-19T12:00:00Z',
      referenceLabel: '19/11/2026 09:00:00 (São Paulo)',
      context: 'Situação atual',
      columns: ['Veículo', 'Detalhe'],
      rows: [],
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  expect(await screen.findByText(empty)).toBeVisible();
  const url = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
  expect(url.pathname).toBe('/api/v1/reports/svo/' + indicator);
  expect(url.search).toBe('');
  expect(screen.getByRole('button', { name: 'Gerar PDF' })).toBeEnabled();
  fetchMock.mockResolvedValueOnce(Response.json({}, { status: 500 }));
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  expect(await screen.findByText(/Não foi possível gerar o relatório/)).toBeVisible();
  expect(screen.queryByText(empty)).not.toBeInTheDocument();
});

it('aplica os filtros de viagens do SVO e distingue lista vazia de acesso negado', async () => {
  const sectorId = '50ddcc1c-d8f0-49e4-8881-d3786a7ad6fe';
  const snapshotId = 'cd11d21c-21f1-4aa1-bb14-f6e1ae9434c0';
  const user = await openFuelings();
  fetchMock.mockResolvedValueOnce(Response.json([{ id: sectorId, name: 'SVO de teste' }]));
  await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
  await user.selectOptions(screen.getByLabelText('Relatório individual'), 'ongoing-trips');
  expect(screen.queryByLabelText('Data inicial')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Período')).toHaveValue('today');
  await screen.findByRole('option', { name: 'SVO de teste' });
  await user.selectOptions(screen.getByLabelText('Setor'), sectorId);
  await user.selectOptions(screen.getByLabelText('Período'), 'week');
  fetchMock.mockResolvedValueOnce(
    Response.json({
      snapshotId,
      title: 'Viagens em andamento',
      referenceAt: '2026-11-19T12:00:00Z',
      referenceLabel: '19/11/2026 09:00:00 (São Paulo)',
      context: 'Período: Últimos 7 dias | Setor: SVO de teste',
      columns: ['Viagem', 'Setor do veículo', 'Motorista', 'Veículo', 'Início', 'Status'],
      rows: [],
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  expect(
    await screen.findByText('Nenhuma viagem aberta para os filtros selecionados.'),
  ).toBeVisible();
  const request = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
  expect(request.pathname).toBe('/api/v1/reports/svo/ongoing-trips');
  expect(request.searchParams.get('period')).toBe('week');
  expect(request.searchParams.get('sectorId')).toBe(sectorId);
  expect(screen.getByRole('button', { name: 'Gerar Excel' })).toBeEnabled();
  await user.selectOptions(screen.getByLabelText('Período'), 'all');
  expect(screen.queryByText('Nenhuma viagem aberta para os filtros selecionados.')).toBeNull();
  expect(screen.getByRole('button', { name: 'Gerar Excel' })).toBeDisabled();
  fetchMock.mockResolvedValueOnce(Response.json({}, { status: 403 }));
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  expect(await screen.findByText(/Você não possui permissão para este relatório/)).toBeVisible();
  expect(screen.queryByText('Nenhuma viagem aberta para os filtros selecionados.')).toBeNull();
});
afterEach(() => {
  queryClient.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

it.each(['availability', 'fleet-status'])(
  'usa a consulta %s para prévia, downloads e impressão',
  async (indicator) => {
    const user = await openFuelings();
    await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
    await user.selectOptions(screen.getByLabelText('Relatório individual'), indicator);
    const snapshotId = 'cd11d21c-21f1-4aa1-bb14-f6e1ae9434c0';
    const referenceLabel = '19/11/2026 09:00:00 (São Paulo)';
    const print = vi.fn();
    vi.stubGlobal('print', print);
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => 'blob:report');
        static revokeObjectURL = vi.fn();
      },
    );
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(
      Response.json({
        snapshotId,
        title: indicator === 'availability' ? 'Disponibilidade da frota' : 'Frota por status',
        referenceAt: '2026-11-19T12:00:00Z',
        referenceLabel,
        totalActive: 4,
        rows: ['Disponíveis', 'Em rota', 'Em manutenção', 'Indisponíveis'].map((label) => ({
          label,
          count: 1,
          percentage: 25,
        })),
      }),
    );
    expect(screen.queryByLabelText('Data inicial')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Consultar situação atual' }));
    expect(await screen.findByText('Referência: ' + referenceLabel)).toBeInTheDocument();
    expect(screen.getByText('Total da frota ativa: 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gerar PDF' })).toHaveAccessibleDescription(
      'PDF, Excel e impressão utilizam os mesmos dados da consulta realizada. Após 30 minutos, poderá ser necessário realizar uma nova consulta.',
    );
    await user.click(screen.getByRole('button', { name: 'Imprimir' }));
    expect(print).toHaveBeenCalledOnce();
    for (const [format, label, mime] of [
      ['pdf', 'Gerar PDF', 'application/pdf'],
      ['excel', 'Gerar Excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ] as const) {
      fetchMock.mockResolvedValueOnce(new Response('file', { headers: { 'Content-Type': mime } }));
      await user.click(screen.getByRole('button', { name: label }));
      await waitFor(() => expect(screen.getByRole('button', { name: label })).toBeEnabled());
      const request = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
      expect(request.pathname).toBe('/api/v1/reports/svo/' + indicator + '/' + format);
      expect(request.searchParams.get('snapshotId')).toBe(snapshotId);
    }
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.getByText('Referência: ' + referenceLabel)).toBeInTheDocument();
  },
);

async function openFuelings() {
  const user = userEvent.setup();
  render(
    <AppProviders>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/relatorios'] })} />
    </AppProviders>,
  );
  await user.selectOptions(
    await screen.findByLabelText('Tipo', undefined, { timeout: 10000 }),
    'individual',
  );
  await user.selectOptions(screen.getByLabelText('Relatório individual'), 'fuelings');
  return user;
}
function dates() {
  fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-11-01' } });
  fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-11-14' } });
}

it('valida antes de consultar e imprime somente JSON consultado com filtros aplicados', async () => {
  const user = await openFuelings();
  const print = vi.fn();
  vi.stubGlobal('print', print);
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(screen.getByLabelText('Data inicial')).toHaveAttribute('aria-invalid', 'true');
  expect(fetchMock).not.toHaveBeenCalled();
  dates();
  expect(screen.getByRole('button', { name: 'Gerar PDF' })).toBeDisabled();
  fetchMock.mockResolvedValue(Response.json(fuelingFixture));
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByText('ABC1D23')).toBeInTheDocument();
  expect(screen.getByText('Total de abastecimentos: 1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Gerar PDF' })).toHaveAccessibleDescription(
    'Impressão utiliza os dados consultados. PDF e Excel consultam novamente o backend e podem refletir alterações posteriores.',
  );
  expect(screen.getByRole('button', { name: 'Gerar PDF' })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(print).toHaveBeenCalledOnce();
  fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-11-15' } });
  expect(screen.getByText(/Filtros alterados/)).toBeInTheDocument();
  expect(screen.getByText('Período aplicado: 01/11/2026 a 14/11/2026')).toBeInTheDocument();
  for (const name of ['Gerar PDF', 'Gerar Excel', 'Imprimir'])
    expect(screen.getByRole('button', { name })).toBeDisabled();
  await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
  expect(screen.queryByText('ABC1D23')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Consultar abastecimentos' }),
  ).not.toBeInTheDocument();
});

it('mostra ausência de resultados sem habilitar exportações', async () => {
  const user = await openFuelings();
  dates();
  fetchMock.mockResolvedValue(
    Response.json({
      ...fuelingFixture,
      items: [],
      totals: { totalFuelings: 0, totalLiters: 0, totalValue: 0 },
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByText(/Nenhum abastecimento encontrado/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Gerar Excel' })).toBeDisabled();
});

it.each([403, 404, 400])('mostra erro HTTP %s e mantém ações bloqueadas', async (status) => {
  const user = await openFuelings();
  dates();
  fetchMock.mockResolvedValue(
    Response.json({ detail: 'Motivo informado pelo servidor' }, { status }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByText(/Motivo informado pelo servidor/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Imprimir' })).toBeDisabled();
});

it('encerra a sessão quando a consulta retorna 401 para o token atual', async () => {
  const user = await openFuelings();
  dates();
  fetchMock.mockResolvedValueOnce(Response.json({ detail: 'Sessão expirada' }, { status: 401 }));
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  expect(authToken.get()).toBeNull();
  expect(screen.queryByRole('button', { name: 'Imprimir' })).not.toBeInTheDocument();
});

it('mostra carregamento e bloqueia consultas concorrentes', async () => {
  const user = await openFuelings();
  dates();
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done;
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(screen.getByText('Aguarde a resposta do backend.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Processando…' })).toBeDisabled();
  resolve(Response.json(fuelingFixture));
  expect(await screen.findByText('ABC1D23')).toBeInTheDocument();
});

it('aciona download pela página e bloqueia ações se a API negar a exportação', async () => {
  const user = await openFuelings();
  dates();
  fetchMock.mockResolvedValueOnce(Response.json(fuelingFixture));
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByText('ABC1D23')).toBeInTheDocument();
  fetchMock.mockResolvedValueOnce(Response.json({ detail: 'Permissão revogada' }, { status: 403 }));
  await user.click(screen.getByRole('button', { name: 'Gerar Excel' }));
  expect(await screen.findByText(/Permissão revogada/)).toBeInTheDocument();
  expect((fetchMock.mock.calls[1]![0] as Request).url).toContain('/fuelings/excel?');
  expect(screen.queryByText('ABC1D23')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Imprimir' })).toBeDisabled();
});

it('não imprime resultado de outra sessão', async () => {
  const user = await openFuelings();
  dates();
  const print = vi.fn();
  vi.stubGlobal('print', print);
  fetchMock.mockResolvedValueOnce(Response.json(fuelingFixture));
  await user.click(screen.getByRole('button', { name: 'Consultar abastecimentos' }));
  expect(await screen.findByText('ABC1D23')).toBeInTheDocument();
  act(() => authToken.set('outra-sessao'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Imprimir' })).toBeDisabled());
  expect(print).not.toHaveBeenCalled();
  expect(screen.queryByText('ABC1D23')).not.toBeInTheDocument();
});

async function checkSvoOutput(
  user: ReturnType<typeof userEvent.setup>,
  indicator: string,
  snapshotId: string,
) {
  const print = vi.fn();
  vi.stubGlobal('print', print);
  const createObjectURL = vi.fn(() => 'blob:report');
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = vi.fn();
    },
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  await user.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(print).toHaveBeenCalledOnce();

  for (const [format, label, mime] of [
    ['pdf', 'Gerar PDF', 'application/pdf'],
    ['excel', 'Gerar Excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ] as const) {
    fetchMock.mockResolvedValueOnce(new Response('report', { headers: { 'Content-Type': mime } }));
    await user.click(screen.getByRole('button', { name: label }));
    await waitFor(() => expect(screen.getByRole('button', { name: label })).toBeEnabled());
    const request = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
    expect(request.pathname).toBe('/api/v1/reports/svo/' + indicator + '/' + format);
    expect(request.searchParams.get('snapshotId')).toBe(snapshotId);
  }
  expect(createObjectURL).toHaveBeenCalledTimes(2);
}

it.each([
  ['triage', 'Triagem e alocação'],
  ['daily-requests', 'Solicitações por dia'],
  ['ongoing-trips', 'Viagens em andamento'],
  ['vehicle-consumption', 'Consumo por veículo'],
  ['recent-fuelings', 'Abastecimentos recentes'],
  ['maintenance-alerts', 'Alertas de manutenção'],
])('reutiliza o snapshot de %s para PDF, Excel e impressão', async (indicator, title) => {
  const user = await openFuelings();
  if (indicator === 'ongoing-trips') fetchMock.mockResolvedValueOnce(Response.json([]));
  await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
  await user.selectOptions(screen.getByLabelText('Relatório individual'), indicator);
  const snapshotId = 'cd11d21c-21f1-4aa1-bb14-f6e1ae9434c0';
  fetchMock.mockResolvedValueOnce(
    Response.json({
      snapshotId,
      title,
      referenceAt: '2026-11-19T12:00:00Z',
      referenceLabel: '19/11/2026 09:00:00',
      context: 'Consulta de teste',
      columns: ['Dados'],
      rows: [['Linha da consulta']],
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Consultar relatório' }));
  expect(await screen.findByText('Linha da consulta')).toBeVisible();
  const request = new URL((fetchMock.mock.lastCall?.[0] as Request).url);
  expect(request.pathname).toBe('/api/v1/reports/svo/' + indicator);
  await checkSvoOutput(user, indicator, snapshotId);
});

import type { SvoIndicator, SvoOperationIndicator, ReportFilters } from './reports.types';
import { getIndicators } from './reports.types';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { authToken } from '@/shared/api/auth-token';
import { parseProblemDetail } from '@/shared/api/problem-detail';

// Confirmed against FuelingReportResponse at backend commit 6c0475f.
// Runtime validation until a published OpenAPI contract is available.
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const reportSchema = z.object({
  referenceLabel: z.string().optional(),
  filters: z.object({ startDate: date, endDate: date, vehicleId: z.uuid().nullish() }),
  items: z.array(
    z.object({
      id: z.uuid(),
      fueledOn: date,
      vehicleId: z.uuid(),
      vehiclePlate: z.string().min(1),
      vehicleModel: z.string().min(1),
      fuelType: z.enum(['GASOLINE', 'ETHANOL', 'DIESEL', 'DIESEL_S10', 'CNG']),
      liters: z.number().positive(),
      totalValue: z.number().positive(),
      pricePerLiter: z.number().nonnegative(),
    }),
  ),
  totals: z.object({
    totalFuelings: z.number().int().nonnegative(),
    totalLiters: z.number().nonnegative(),
    totalValue: z.number().nonnegative(),
  }),
});

export type FuelingReport = z.infer<typeof reportSchema>;
export type FuelingQuery = { startDate: string; endDate: string };
export type ExportFormat = 'pdf' | 'excel';

export class ReportApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

async function request(path: string, query: Record<string, string>, format?: ExportFormat) {
  if (!authToken.get())
    throw new ReportApiError('Sessão ausente. Autentique-se para consultar relatórios.', 401);
  const mime =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  let response: Response;
  try {
    response = await apiRequest(
      `/api/v1/reports/${path}${format ? `/${format}` : ''}?${new URLSearchParams(query)}`,
      {
        headers: { Accept: `${format ? mime : 'application/json'}, application/problem+json` },
      },
    );
  } catch {
    throw new ReportApiError(
      'Não foi possível conectar à API. Verifique a disponibilidade do backend.',
    );
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const problem = parseProblemDetail(body);
    const messages: Record<number, string> = {
      401: 'Sessão inválida ou expirada. Autentique-se novamente.',
      403: 'Você não possui permissão para este relatório.',
      404: 'Relatório ou recurso indisponível nesta versão do backend.',
      400:
        path === 'svo/general' && format
          ? 'Não foi possível gerar o arquivo.'
          : 'Filtros inválidos ou limite de consulta excedido. Revise o período.',
      422: 'Filtros inválidos ou limite de consulta excedido. Revise o período.',
    };
    const base = messages[response.status] ?? 'Não foi possível gerar o relatório.';
    throw new ReportApiError(
      [base, problem.detail, ...(problem.violations?.map((v) => `${v.field}: ${v.message}`) ?? [])]
        .filter(Boolean)
        .join(' '),
      response.status,
    );
  }
  const type = response.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase();
  if (type !== (format ? mime : 'application/json')) {
    throw new ReportApiError(
      'Resposta incompatível com o relatório solicitado. Verifique a versão do backend.',
    );
  }
  return response;
}

export async function queryFuelings(query: FuelingQuery): Promise<FuelingReport> {
  const response = await request('fuelings', query);
  const parsed = reportSchema.safeParse(await response.json().catch(() => null));
  if (
    !parsed.success ||
    parsed.data.filters.startDate !== query.startDate ||
    parsed.data.filters.endDate !== query.endDate ||
    parsed.data.filters.vehicleId != null ||
    parsed.data.totals.totalFuelings !== parsed.data.items.length
  ) {
    throw new ReportApiError('Dados incompatíveis com o contrato ou com os filtros aplicados.');
  }
  return parsed.data;
}

export async function downloadFuelings(query: FuelingQuery, format: ExportFormat) {
  await saveReport(await request('fuelings', query, format), 'abastecimentos', format);
}

async function saveReport(response: Response, filename: string, format: ExportFormat) {
  const blob = await response.blob();
  if (!blob.size) throw new ReportApiError('O backend retornou um arquivo vazio.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  try {
    link.href = url;
    link.download = `${filename}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    // Allow the browser to consume the object URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

const svoSchema = z.object({
  snapshotId: z.uuid(),
  title: z.string(),
  referenceAt: z.iso.datetime(),
  referenceLabel: z.string(),
  totalActive: z.number().int().nonnegative(),
  rows: z
    .array(
      z.object({
        label: z.string(),
        count: z.number().int().nonnegative(),
        percentage: z.number().min(0).max(100),
      }),
    )
    .length(4),
});

export type SvoFleetReport = z.infer<typeof svoSchema>;

export async function querySvoFleet(indicator: SvoIndicator): Promise<SvoFleetReport> {
  const response = await request('svo/' + indicator, {});
  const result = svoSchema.safeParse(await response.json().catch(() => null));
  if (!result.success) throw new ReportApiError('Dados incompatíveis com o relatório SVO.');
  return result.data;
}

const svoOperationSchema = z
  .object({
    snapshotId: z.uuid(),
    title: z.string(),
    referenceAt: z.iso.datetime(),
    referenceLabel: z.string(),
    context: z.string(),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())),
  })
  .refine(({ columns, rows }) => rows.every((row) => row.length === columns.length));

export type SvoOperationReport = z.infer<typeof svoOperationSchema>;

const svoGeneralSchema = z
  .object({
    snapshotId: z.uuid(),
    title: z.string(),
    referenceAt: z.iso.datetime(),
    referenceLabel: z.string(),
    sections: z
      .array(
        z
          .object({
            indicator: z.custom<SvoIndicator>((value) =>
              getIndicators('svo').some(({ id }) => id === value),
            ),
            title: z.string(),
            context: z.string(),
            columns: z.array(z.string()).min(1),
            rows: z.array(z.array(z.string())),
          })
          .refine(({ columns, rows }) => rows.every((row) => row.length === columns.length)),
      )
      .length(8),
  })
  .refine(({ sections }) => new Set(sections.map(({ indicator }) => indicator)).size === 8);

export type SvoGeneralReport = z.infer<typeof svoGeneralSchema>;

function tripQuery(filters: ReportFilters) {
  const query: Record<string, string> = { period: filters.tripPeriod ?? 'today' };
  if (filters.sectorId) query.sectorId = filters.sectorId;
  return query;
}

export async function querySvoGeneral(filters: ReportFilters) {
  const response = await request('svo/general', tripQuery(filters));
  const result = svoGeneralSchema.safeParse(await response.json().catch(() => null));
  if (!result.success)
    throw new ReportApiError('Dados incompatíveis com o relatório geral do SVO.');
  return result.data;
}

export async function querySvoOperation(indicator: SvoOperationIndicator, filters: ReportFilters) {
  const query = indicator === 'ongoing-trips' ? tripQuery(filters) : {};
  const response = await request('svo/' + indicator, query);
  const result = svoOperationSchema.safeParse(await response.json().catch(() => null));
  if (!result.success) throw new ReportApiError('Dados incompatíveis com o relatório SVO.');
  return result.data;
}

export async function downloadSvoFleet(
  indicator: SvoIndicator | 'general',
  snapshotId: string,
  format: ExportFormat,
) {
  await saveReport(await request('svo/' + indicator, { snapshotId }, format), indicator, format);
}

import { validateReportFilters } from './reports.validation';
import type { ReportFilters } from './reports.types';

const filters: ReportFilters = {
  module: 'fleet',
  kind: 'general',
  indicator: '',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
};

describe('validação do período dos relatórios', () => {
  it('aceita intervalo válido e o mesmo dia', () => {
    expect(validateReportFilters(filters)).toEqual({});
    expect(validateReportFilters({ ...filters, endDate: filters.startDate })).toEqual({});
  });

  it('exige ambas as datas e rejeita intervalo invertido', () => {
    expect(validateReportFilters({ ...filters, startDate: '', endDate: '' })).toMatchObject({
      startDate: expect.any(String),
      endDate: expect.any(String),
    });
    expect(validateReportFilters({ ...filters, endDate: '2025-12-31' }).endDate).toMatch(
      /posterior/,
    );
  });

  it.each(['2026-02-29', '2026-04-31', '0000-01-01', '31/01/2026'])(
    'rejeita data inexistente ou inválida: %s',
    (startDate) => {
      expect(validateReportFilters({ ...filters, startDate }).startDate).toBeDefined();
    },
  );

  it('aceita ano bissexto', () => {
    expect(validateReportFilters({ ...filters, startDate: '2024-02-29' })).toEqual({});
  });

  it('rejeita indicador ausente, desconhecido ou sem catálogo SVO', () => {
    for (const indicator of ['', 'inventado']) {
      expect(
        validateReportFilters({ ...filters, kind: 'individual', indicator }).indicator,
      ).toBeDefined();
    }
    expect(
      validateReportFilters({ ...filters, kind: 'individual', indicator: 'fuelings' }),
    ).toEqual({});
    expect(
      validateReportFilters({
        ...filters,
        module: 'svo',
        kind: 'individual',
        indicator: 'fuelings',
      }).indicator,
    ).toBeDefined();
  });
});

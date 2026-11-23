import type { ReportFilters } from './reports.types';
import { getIndicators, getSvoIndicator, isSvoGeneral } from './reports.types';

type FilterErrors = Partial<Record<'startDate' | 'endDate' | 'indicator', string>>;

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateReportFilters(filters: ReportFilters): FilterErrors {
  const errors: FilterErrors = {};
  if (getSvoIndicator(filters) || isSvoGeneral(filters)) return errors;
  if (!isCalendarDate(filters.startDate)) errors.startDate = 'Informe uma data inicial válida.';
  if (!isCalendarDate(filters.endDate)) errors.endDate = 'Informe uma data final válida.';
  if (!errors.startDate && !errors.endDate && filters.startDate > filters.endDate) {
    errors.endDate = 'A data final deve ser igual ou posterior à data inicial.';
  }
  if (
    filters.kind === 'individual' &&
    !getIndicators(filters.module).some(({ id }) => id === filters.indicator)
  ) {
    errors.indicator = 'Selecione um relatório individual disponível no catálogo.';
  }
  return errors;
}

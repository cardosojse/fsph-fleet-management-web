export type ReportModule = 'fleet' | 'svo';
export type ReportKind = 'general' | 'individual';

export type ReportFilters = {
  module: ReportModule;
  kind: ReportKind;
  indicator: string;
  startDate: string;
  endDate: string;
  tripPeriod?: TripPeriod;
  sectorId?: string;
};

export const moduleLabels: Record<ReportModule, string> = {
  fleet: 'Gestão de Frotas',
  svo: 'SVO',
};

// Existing consultation kept during the dashboard integration.
const fleetIndicators = [{ id: 'fuelings', label: 'Abastecimentos' }] as const;

export const tripPeriods = {
  today: 'Hoje',
  week: 'Últimos 7 dias',
  all: 'Todo o período',
} as const;
export type TripPeriod = keyof typeof tripPeriods;

const operationIndicators = [
  { id: 'triage', label: 'Triagem e alocação' },
  { id: 'daily-requests', label: 'Solicitações por dia' },
  { id: 'ongoing-trips', label: 'Viagens em andamento' },
  { id: 'vehicle-consumption', label: 'Consumo por veículo' },
  { id: 'recent-fuelings', label: 'Abastecimentos recentes' },
  { id: 'maintenance-alerts', label: 'Alertas de manutenção' },
] as const;

export type SvoOperationIndicator = (typeof operationIndicators)[number]['id'];

const svoIndicators = [
  { id: 'availability', label: 'Disponibilidade da frota' },
  { id: 'fleet-status', label: 'Frota por status' },
  ...operationIndicators,
] as const;

export type SvoIndicator = (typeof svoIndicators)[number]['id'];

export function isSvoGeneral(filters: ReportFilters) {
  return filters.module === 'svo' && filters.kind === 'general';
}

export function getSvoIndicator(filters: ReportFilters): SvoIndicator | undefined {
  if (filters.module !== 'svo' || filters.kind !== 'individual') return;
  return svoIndicators.find(({ id }) => id === filters.indicator)?.id;
}

export function isSvoOperationIndicator(
  indicator?: SvoIndicator,
): indicator is SvoOperationIndicator {
  return operationIndicators.some(({ id }) => id === indicator);
}

export function getIndicators(module: ReportModule) {
  return module === 'fleet' ? fleetIndicators : svoIndicators;
}

export function getReportLabel(filters: ReportFilters) {
  if (filters.kind === 'general') return 'Geral';
  return (
    getIndicators(filters.module).find(({ id }) => id === filters.indicator)?.label ??
    'Individual — selecione um relatório'
  );
}

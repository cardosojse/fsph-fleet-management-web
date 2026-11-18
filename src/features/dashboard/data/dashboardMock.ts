export type DashboardSector = 'SVO' | 'Administrativo';
export type DashboardPeriod = 'today' | 'week' | 'all';

export interface FleetRequestRow {
  protocol: string;
  sector: DashboardSector;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  time: string;
  date: string;
  status: string;
  occupancy: string;
  isFull?: boolean;
}

export interface DashboardAlert {
  title: string;
  description: string;
  type: 'maintenance' | 'documents' | 'license';
}

export const fleetIndicators = [
  { label: 'Disponíveis', value: 5, caption: '50% da frota', icon: 'grid', color: 'blue' },
  { label: 'Em rota', value: 3, caption: '3 em execução', icon: 'route', color: 'green' },
  {
    label: 'Em manutenção',
    statusLabel: 'Manutenção',
    value: 1,
    caption: '1 veículo',
    icon: 'tool',
    color: 'orange',
  },
  {
    label: 'Indisponíveis',
    statusLabel: 'Indisponível',
    value: 1,
    caption: '1 veículo',
    icon: 'car',
    color: 'red',
  },
] as const;

export const operationIndicators = [
  { label: 'Triagens pendentes', value: '3' },
  { label: 'Aloc. pendentes', value: '2' },
  { label: 'Solicitações / dia', value: '12' },
  { label: 'Rotas ativas', value: '3' },
] as const;

export const requestsPerDay = [
  { day: '30/09', count: 6 },
  { day: '01/10', count: 10 },
  { day: '02/10', count: 8 },
  { day: '03/10', count: 14 },
  { day: '04/10', count: 16 },
  { day: '05/10', count: 20 },
  { day: '06/10', count: 12 },
] as const;

export const fleetRequests: FleetRequestRow[] = [
  {
    protocol: 'SVO-2026-0402',
    sector: 'SVO',
    origin: 'Rua das Flores 120',
    destination: 'Sede SVO',
    driver: 'Carlos Silva',
    vehicle: 'Van 02',
    time: '14:00',
    date: '2026-10-06',
    status: 'Em execução',
    occupancy: '1/2',
  },
  {
    protocol: 'SVO-2026-0401',
    sector: 'SVO',
    origin: 'Hospital Municipal',
    destination: 'Sede SVO',
    driver: 'Marcos Oliveira',
    vehicle: 'Carro 04',
    time: '13:30',
    date: '2026-10-06',
    status: 'Em execução',
    occupancy: '1/1 Lotado',
    isFull: true,
  },
  {
    protocol: 'ADM-2026-0105',
    sector: 'Administrativo',
    origin: 'Sede FSPH',
    destination: 'Almoxarifado',
    driver: 'João Santos',
    vehicle: 'S10',
    time: '14:10',
    date: '2026-10-06',
    status: 'Em execução',
    occupancy: '3/4',
  },
  {
    protocol: 'SVO-2026-0398',
    sector: 'SVO',
    origin: 'Sede SVO',
    destination: 'Hospital Municipal',
    driver: 'Carlos Silva',
    vehicle: 'Van 02',
    time: '10:40',
    date: '2026-10-03',
    status: 'Concluída',
    occupancy: '2/2',
  },
  {
    protocol: 'ADM-2026-0102',
    sector: 'Administrativo',
    origin: 'Almoxarifado',
    destination: 'Sede FSPH',
    driver: 'João Santos',
    vehicle: 'S10',
    time: '09:15',
    date: '2026-10-01',
    status: 'Concluída',
    occupancy: '1/4',
  },
];

export const consumptionByVehicle = [
  { vehicle: 'Van 02', distance: '300 km ÷ 30 L', consumption: '10,0 km/l' },
  { vehicle: 'S10', distance: '240 km ÷ 30 L', consumption: '8,0 km/l' },
  { vehicle: 'Carro 04', distance: 'Sem dados recentes', consumption: '—' },
] as const;

export const fuelByVehicle = [
  { vehicle: 'Van 02', detail: 'Diesel • 30 L • R$6/L', amount: 'R$180,00' },
  { vehicle: 'S10', detail: '240 km ÷ 30 L', amount: 'R$380,00' },
  { vehicle: 'Carro 04', detail: 'Sem dados recentes', amount: '—' },
] as const;

export const dashboardAlerts: DashboardAlert[] = [
  {
    title: 'Carro 01 — Troca de suspensão',
    description: 'Previsão: 07/10/2026',
    type: 'maintenance',
  },
  {
    title: 'Van 01 — Documentos vencidos',
    description: 'CRLV vencido 30/09/2026',
    type: 'documents',
  },
  { title: 'Pedro — CNH vencida', description: 'Bloqueado para nova rota', type: 'license' },
];

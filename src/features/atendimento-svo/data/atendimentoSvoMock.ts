import type {
  DutyTeam,
  RouteRecord,
  RouteStopRecord,
  SvoDemoRequest,
  TransportRecord,
} from '../types';

/** Domain mock: attributes and status values follow TRANSPORTS in the Mermaid model. */
export const transports: TransportRecord[] = [
  {
    id: 'tr-0404',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-1',
    occurred_at: '2026-10-06T14:00:00',
    service_type: 'Hospitalar',
    pickup_location: 'UPA Central',
    destination: 'Sede SVO',
    status: 'PENDING',
  },
  {
    id: 'tr-0405',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-2',
    occurred_at: '2026-10-06T13:50:00',
    service_type: 'Domiciliar',
    pickup_location: 'Domiciliar • endereço incompleto',
    destination: 'Cemitério da Paz',
    status: 'PENDING',
  },
  {
    id: 'tr-0406',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-3',
    occurred_at: '2026-10-06T14:10:00',
    service_type: 'Hospitalar',
    pickup_location: 'Hospital Municipal',
    destination: 'Sede SVO',
    status: 'PENDING',
  },
  {
    id: 'tr-0403',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-4',
    occurred_at: '2026-10-06T13:35:00',
    service_type: 'Hospitalar',
    pickup_location: 'UPA Central',
    destination: 'Sede SVO',
    status: 'ASSIGNED',
  },
  {
    id: 'tr-0402',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-5',
    occurred_at: '2026-10-06T13:20:00',
    service_type: 'Domiciliar',
    pickup_location: 'Rua das Flores, 120',
    destination: 'Sede SVO',
    status: 'ASSIGNED',
  },
  {
    id: 'tr-0401',
    sector_id: 'svo',
    requested_by_user_id: 'usr-demo-6',
    occurred_at: '2026-10-06T13:15:00',
    service_type: 'Hospitalar',
    pickup_location: 'Hospital Municipal',
    destination: 'Sede SVO',
    status: 'ASSIGNED',
  },
  {
    id: 'tr-adm-0105',
    sector_id: 'administrativo',
    requested_by_user_id: 'usr-demo-7',
    occurred_at: '2026-10-06T14:10:00',
    service_type: 'Administrativo',
    pickup_location: 'Sede FSPH',
    destination: 'Administração',
    status: 'ASSIGNED',
  },
];

/** SVO-only presentation data for this prototype; not a database/API model. */
export const initialSvoRequests: SvoDemoRequest[] = [
  {
    id: 'svo-0404',
    transportId: 'tr-0404',
    protocol: 'SVO-2026-0404',
    status: 'Em análise',
    enteredAt: '14:00',
    wait: '20 min',
    sector: 'SVO',
    notes:
      'A unidade solicita coleta com acesso pela entrada de serviço. Confirmar a liberação da enfermagem antes da chegada. Manter abordagem respeitosa e identificação da equipe.',
    contact: 'Ana Costa • (79) 3200-0100 • ramal 203 • contato fictício',
    analysis:
      'Dados da unidade e destino conferidos. Coleta hospitalar compatível com o SVO. Confirmar liberação da enfermagem antes do deslocamento.',
    analysisSavedAt: '06/10/2026 às 14:12',
    complementRequests: [],
    history: [
      { id: 'evt-0404-1', time: '14:12', action: 'Análise salva' },
      { id: 'evt-0404-2', time: '14:00', action: 'Recebimento da solicitação' },
    ],
  },
  {
    id: 'svo-0405',
    transportId: 'tr-0405',
    protocol: 'SVO-2026-0405',
    status: 'Aguardando complemento',
    enteredAt: '13:50',
    wait: '30 min',
    sector: 'SVO',
    notes: 'Solicitação aguardando informação complementar do endereço de coleta.',
    contact: 'Contato demonstrativo • dados fictícios',
    analysis: '',
    complementRequests: [
      'Informe logradouro, número, bairro e ponto de referência do local de coleta.',
    ],
    history: [
      { id: 'evt-0405-1', time: '14:05', action: 'Complemento solicitado' },
      { id: 'evt-0405-2', time: '13:50', action: 'Solicitação recebida' },
    ],
  },
  {
    id: 'svo-0406',
    transportId: 'tr-0406',
    protocol: 'SVO-2026-0406',
    status: 'Aguardando análise',
    enteredAt: '14:10',
    wait: '10 min',
    sector: 'SVO',
    notes: 'Solicitação hospitalar aguardando análise.',
    contact: 'Contato demonstrativo • dados fictícios',
    analysis: '',
    complementRequests: [],
    history: [{ id: 'evt-0406-1', time: '14:10', action: 'Solicitação recebida' }],
  },
  {
    id: 'svo-0403',
    transportId: 'tr-0403',
    protocol: 'SVO-2026-0403',
    status: 'Aprovada',
    enteredAt: '13:35',
    wait: '—',
    sector: 'SVO',
    notes: 'Solicitação aprovada e aguardando alocação logística.',
    contact: 'Contato demonstrativo • dados fictícios',
    analysis: 'Dados conferidos para encaminhamento à Logística.',
    complementRequests: [],
    history: [{ id: 'evt-0403-1', time: '13:35', action: 'Solicitação aprovada' }],
  },
  {
    id: 'svo-0402',
    transportId: 'tr-0402',
    protocol: 'SVO-2026-0402',
    status: 'Em execução',
    enteredAt: '13:20',
    wait: '—',
    sector: 'SVO',
    notes: 'Rota em execução.',
    contact: 'Contato demonstrativo • dados fictícios',
    analysis: '',
    complementRequests: [],
    history: [{ id: 'evt-0402-1', time: '13:20', action: 'Rota iniciada' }],
  },
];

/** Route and stop mocks use the entity boundaries/fields defined by Mermaid. */
export const routes: RouteRecord[] = [
  {
    id: 'ROT-0089',
    vehicle_id: 'veh-02',
    driver_id: 'usr-driver-1',
    created_by_user_id: 'usr-coord-1',
    status: 'IN_PROGRESS',
    planned_start_at: '2026-10-06T14:00:00',
    real_start_at: '2026-10-06T14:00:00',
    start_mileage: 48330,
  },
  {
    id: 'ROT-0088',
    vehicle_id: 'veh-04',
    driver_id: 'usr-driver-2',
    created_by_user_id: 'usr-coord-1',
    status: 'IN_PROGRESS',
    planned_start_at: '2026-10-06T13:30:00',
    real_start_at: '2026-10-06T13:30:00',
    start_mileage: 48100,
  },
  {
    id: 'ROT-0090',
    vehicle_id: 'veh-10',
    driver_id: 'usr-driver-3',
    created_by_user_id: 'usr-coord-2',
    status: 'IN_PROGRESS',
    planned_start_at: '2026-10-06T14:10:00',
    real_start_at: '2026-10-06T14:10:00',
    start_mileage: 22100,
  },
];
export const routeStops: RouteStopRecord[] = [
  {
    id: 'stop-1',
    route_id: 'ROT-0089',
    transport_id: 'tr-0402',
    stop_sequence: 1,
    status: 'PENDING',
  },
  {
    id: 'stop-2',
    route_id: 'ROT-0088',
    transport_id: 'tr-0401',
    stop_sequence: 1,
    status: 'PENDING',
  },
  {
    id: 'stop-3',
    route_id: 'ROT-0090',
    transport_id: 'tr-adm-0105',
    stop_sequence: 1,
    status: 'PENDING',
  },
];

export const routeDisplay: Readonly<
  Partial<
    Record<
      string,
      {
        protocol: string;
        driver: string;
        vehicle: string;
        occupancy: string;
        full?: boolean;
      }
    >
  >
> = {
  'ROT-0089': {
    protocol: 'SVO-2026-0402',
    driver: 'Carlos Silva',
    vehicle: 'Van 02',
    occupancy: '1/2',
  },
  'ROT-0088': {
    protocol: 'SVO-2026-0401',
    driver: 'Marcos Oliveira',
    vehicle: 'Carro 04',
    occupancy: '1/1',
    full: true,
  },
  'ROT-0090': {
    protocol: 'ADM-2026-0105',
    driver: 'João Santos',
    vehicle: 'S10',
    occupancy: '3/4',
  },
};

export const dutyTeams: DutyTeam[] = [
  {
    name: 'SVO Alfa',
    driver: 'Carlos Silva • técnica Beatriz Lima',
    vehicle: 'Van 02 • capacidade 2 • ocupação 1/2',
    capacity: '07–19 • Rota 009 • CNH válida até 15/08/2027',
    occupancy: '1/2',
    state: 'Em rota',
  },
  {
    name: 'SVO Bravo',
    driver: 'Marcos Oliveira • técnico Rafael Costa',
    vehicle: 'Carro 04 • capacidade 1 • ocupação 1/1',
    capacity: '07–19 • Rota 008 • CNH válida até 10/12/2027',
    occupancy: '1/1',
    state: 'Em rota',
    full: true,
  },
  {
    name: 'SVO Reserva',
    driver: 'Paula Mendes • Camila Rocha',
    vehicle: 'Van 05 • capacidade 3 • ocupação 0/3',
    capacity: '07–19 • Sem rota alocada • CNH válida até 04/12/2027',
    occupancy: '0/3',
    state: 'Disponível',
  },
];

export const statusOptions = [
  'Todos',
  'Em análise',
  'Aguardando complemento',
  'Aguardando análise',
  'Aprovada',
  'Negada',
  'Em execução',
] as const;

export function getTransport(transportId: string) {
  return transports.find((transport) => transport.id === transportId);
}

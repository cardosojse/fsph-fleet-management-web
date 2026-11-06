import type { Driver, Vehicle } from './types';

export const initialVehicles: Vehicle[] = [
  {
    id: 1,
    plate: 'ABC-1D23',
    model: 'Fiat Argo',
    category: 'Passeio',
    driver: 'João Silva',
    status: 'Ativo',
    // Fictional supplementary details, used only by the local demonstration.
    year: 2023,
    sector: 'Administrativo',
    fuel: 'Flex',
    crlvExpiry: '2099-12-31',
    insuranceExpiry: '2099-12-31',
    capacity: 5,
    mileage: 45000,
    occupancy: 1,
    documentReferences: 'CRLV e seguro demonstrativos, sem arquivos.',
    lastRefueling: {
      description: 'Exemplo local: 30 litros, sem transação real.',
      fuel: 'Gasolina',
    },
    card: {
      limitCents: 150000,
      usedCents: 25000,
      expiry: '2099-12-31',
      notes: 'Carta demonstrativa.',
    },
  },
  {
    id: 2,
    plate: 'DEF-4G56',
    model: 'Chevrolet Onix',
    category: 'Passeio',
    driver: 'Maria Santos',
    status: 'Ativo',
  },
  {
    id: 3,
    plate: 'GHI-7J89',
    model: 'Fiat Fiorino',
    category: 'Utilitário',
    driver: 'Carlos Lima',
    status: 'Manutenção',
  },
  {
    id: 4,
    plate: 'JKL-2M34',
    model: 'Renault Master',
    category: 'Van',
    driver: 'Não atribuído',
    status: 'Inativo',
  },
];

export const initialDrivers: Driver[] = [
  // Fictional local simulation only; existing names and license identifiers are preserved.
  {
    id: 1,
    name: 'João Silva',
    license: '12345678901',
    sector: 'Operações',
    status: 'Disponível',
    cpf: '52998224725',
    phone: '11999990000',
    email: 'joao@example.test',
    licenseCategory: 'B',
    licenseExpiry: '2099-12-31',
    document: 'CNH',
    profile: 'Motorista',
    availability: 'Disponível',
    shift: {
      team: 'Equipe demonstrativa',
      date: '2099-06-15',
      start: '07:00',
      end: '12:00',
      vehicleId: 1,
    },
  },
  { id: 2, name: 'Maria Santos', license: '23456789012', sector: 'Logística', status: 'Em rota' },
  { id: 3, name: 'Carlos Lima', license: '34567890123', sector: 'Operações', status: 'Disponível' },
];

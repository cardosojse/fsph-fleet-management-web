import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';
import { demoSvoVehicles } from '@/features/fuel-cards/demo/demo-config';

/** Dados inteiramente fictícios. Status e valores não definem regras de negócio. */
export const demoFuelCards: (FuelCard & { demoNumber: string })[] = [
  {
    id: 'demo-1',
    demoNumber: '1111222233331042',
    card: '•••• 1042',
    vehicle: 'ABC1D23 · Veículo demonstrativo 1',
    sector: 'Administrativo',
    totalLimit: 5000,
    availableBalance: 3250.5,
    validity: '12/2027',
    status: 'Ativo',
  },
  {
    id: 'demo-2',
    demoNumber: '1111222233332086',
    card: '•••• 2086',
    vehicle: 'DEF4G56 · Veículo demonstrativo 2',
    sector: 'Transportes',
    totalLimit: 2500,
    availableBalance: 0,
    validity: '06/2027',
    status: 'Indisponível',
  },
  { id: 'demo-3', demoNumber: '1111222233333091', card: '•••• 3091' },
  ...demoSvoVehicles.map((vehicle, index) => ({
    id: `demo-svo-${index + 1}`,
    demoNumber: `999900000000410${index + 1}`,
    card: `•••• 410${index + 1}`,
    vehicle: vehicle.label,
    sector: vehicle.sector,
  })),
];

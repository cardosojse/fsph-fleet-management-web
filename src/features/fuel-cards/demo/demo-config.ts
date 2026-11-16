// Opções de apresentação fictícias. Não há tradução para ACTIVE, BLOCKED ou EXPIRED.
export const demoStatuses = ['Ativo', 'Indisponível', 'Cancelado'] as const;

export const demoSvoSector = 'SVO — Serviço de Verificação de Óbito';
// Referência informada: três Chevrolet S10. Identificadores abaixo não são placas.
export const demoSvoVehicles = [1, 2, 3].map((index) => ({
  id: `vehicle-demo-svo-${index}`,
  label: `SVO-DEMO-0${index} · Chevrolet S10 (sem placa real)`,
  sector: demoSvoSector,
}));

export const demoVehicles = [
  { id: 'vehicle-demo-1', label: 'ABC1D23 · Veículo demonstrativo 1', sector: 'Administrativo' },
  { id: 'vehicle-demo-2', label: 'DEF4G56 · Veículo demonstrativo 2', sector: 'Transportes' },
  { id: 'vehicle-demo-3', label: 'GHI7J89 · Veículo demonstrativo 3', sector: 'Apoio operacional' },
  ...demoSvoVehicles,
];

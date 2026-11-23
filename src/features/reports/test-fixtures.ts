// Transport fixtures used only by automated tests, never imported by the application.
import type { FuelingReport } from './reports.api';
export const fuelingFixture: FuelingReport = {
  filters: { startDate: '2026-11-01', endDate: '2026-11-14', vehicleId: null },
  items: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      vehicleId: '22222222-2222-4222-8222-222222222222',
      fueledOn: '2026-11-05',
      vehiclePlate: 'ABC1D23',
      vehicleModel: 'Modelo de teste',
      fuelType: 'DIESEL',
      liters: 20,
      pricePerLiter: 6,
      totalValue: 120,
    },
  ],
  totals: { totalFuelings: 1, totalLiters: 20, totalValue: 120 },
};

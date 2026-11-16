import { demoFuelCards } from '@/features/fuel-cards/mocks/fuel-cards';
import { demoStatuses, demoVehicles } from '@/features/fuel-cards/demo/demo-config';
import {
  fuelCardSchema,
  fuelCardEditSchema,
  maskCardNumber,
  normalizeCardNumber,
} from '@/features/fuel-cards/demo/demo-validation';
import type {
  FuelCardsRepository,
  FuelCardFormValues,
} from '@/features/fuel-cards/data/fuel-cards-repository';

/** Adaptador demonstrativo isolado. Nunca persiste números nem efetua chamadas HTTP. */
export function createDemoRepository(): FuelCardsRepository {
  let cards = demoFuelCards.map((card) => ({ ...card }));
  function find(id: string) {
    const card = cards.find((item) => item.id === id);
    if (!card) throw new Error('Cartão não encontrado. Volte à listagem.');
    return card;
  }
  function save(values: FuelCardFormValues, id?: string) {
    const existing = id ? find(id) : undefined;
    const schema = id ? fuelCardEditSchema : fuelCardSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) throw new Error('Revise os campos informados.');
    const number = parsed.data.number
      ? normalizeCardNumber(parsed.data.number)
      : (existing?.demoNumber ?? '');
    if (!number) throw new Error('Informe o número do cartão.');
    if (cards.some((card) => card.id !== id && card.demoNumber === number))
      throw new Error('Já existe um cartão com esse número nesta demonstração.');
    const cardId = id ?? crypto.randomUUID();
    const [year, month] = parsed.data.validity.split('-');
    const updated = {
      ...existing,
      id: cardId,
      demoNumber: number,
      card: maskCardNumber(number),
      totalLimit: Number(parsed.data.limit.replace(',', '.')),
      validity: `${month}/${year}`,
    };
    cards = id ? cards.map((card) => (card.id === id ? updated : card)) : [...cards, updated];
    return { id: cardId };
  }
  return {
    mode: 'demo',
    formSchema: fuelCardSchema,
    editSchema: fuelCardEditSchema,
    async load() {
      return {
        cards: cards.map(({ demoNumber: _number, ...card }) => {
          void _number;
          return card;
        }),
        vehicles: demoVehicles.map((vehicle) => ({ ...vehicle })),
        statusOptions: [...demoStatuses],
      };
    },
    async createCard(values) {
      return save(values);
    },
    async editCard(id, values) {
      return save(values, id);
    },
    async linkVehicle(id, vehicleId) {
      const card = find(id);
      const vehicle = demoVehicles.find((item) => item.id === vehicleId);
      if (!vehicle) throw new Error('Selecione um veículo válido.');
      cards = cards.map((item) =>
        item.id === card.id ? { ...item, vehicle: vehicle.label, sector: vehicle.sector } : item,
      );
    },
    async unlinkVehicle(id) {
      const card = find(id);
      if (!card.vehicle) throw new Error('Não há veículo vinculado a este cartão.');
      cards = cards.map((item) =>
        item.id === id ? { ...item, vehicle: undefined, sector: undefined } : item,
      );
    },
    async changeStatus(id, status) {
      find(id);
      if (!demoStatuses.some((value) => value === status))
        throw new Error('Selecione um status válido.');
      cards = cards.map((item) => (item.id === id ? { ...item, status } : item));
    },
  };
}

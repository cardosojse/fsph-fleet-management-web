import type { ZodType } from 'zod';
import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';

/** Contrato interno da interface, não descreve endpoints ou DTOs do backend. */
export interface FuelCardFormValues {
  number: string;
  limit: string;
  validity: string;
}
export interface FuelCardVehicle {
  id: string;
  label: string;
  sector?: string;
}
export interface FuelCardsSnapshot {
  cards: FuelCard[];
  vehicles: FuelCardVehicle[];
  statusOptions: string[];
}
export interface FuelCardsRepository {
  mode: 'demo' | 'api';
  formSchema: ZodType<FuelCardFormValues, FuelCardFormValues>;
  editSchema: ZodType<FuelCardFormValues, FuelCardFormValues>;
  load: () => Promise<FuelCardsSnapshot>;
  createCard: (values: FuelCardFormValues) => Promise<{ id: string }>;
  editCard: (id: string, values: FuelCardFormValues) => Promise<{ id: string }>;
  linkVehicle: (id: string, vehicleId: string) => Promise<void>;
  unlinkVehicle: (id: string) => Promise<void>;
  changeStatus: (id: string, status: string) => Promise<void>;
}

/** Em produção, a flag é ignorada mesmo se estiver definida no ambiente do build. */
export function isFuelCardsDemoEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_FUEL_CARDS_DEMO === 'true';
}

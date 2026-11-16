/** Modelo de apresentação interno; não representa um contrato da API. */
export interface FuelCard {
  id: string;
  card?: string;
  vehicle?: string;
  sector?: string;
  totalLimit?: number;
  availableBalance?: number;
  validity?: string;
  status?: string;
}

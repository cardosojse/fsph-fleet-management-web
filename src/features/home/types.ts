export type Vehicle = {
  id: number;
  plate: string;
  model: string;
  category: string;
  driver: string;
  status: 'Ativo' | 'Manutenção' | 'Inativo';
  // Local demonstration fields; optional for existing records without these details.
  year?: number;
  sector?: string;
  fuel?: string;
  crlvExpiry?: string;
  insuranceExpiry?: string;
  documentReferences?: string;
  notes?: string;
  capacity?: number;
  mileage?: number;
  occupancy?: number;
  lastRefueling?: { description: string; fuel?: string };
  card?: {
    limitCents: number;
    usedCents: number;
    expiry: string;
    notes: string;
  };
};

export type Driver = {
  id: number;
  name: string;
  license: string;
  sector: string;
  status: 'Disponível' | 'Em rota' | 'Indisponível';
  // Optional for legacy demo records. These values do not represent API integrations.
  cpf?: string;
  phone?: string;
  email?: string;
  licenseCategory?: string;
  licenseExpiry?: string;
  document?: string;
  linkedAccount?: string;
  profile?: string;
  availability?: 'Disponível' | 'Indisponível';
  shift?: {
    team: string;
    date: string;
    start: string;
    end: string;
    vehicleId?: number;
  };
};

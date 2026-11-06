import type { Driver, Vehicle } from '@/features/home/types';

export type VehicleFields = {
  plate: string;
  model: string;
  year: string;
  sector: string;
  fuel: string;
  status: Vehicle['status'];
  category: string;
  crlvExpiry: string;
  insuranceExpiry: string;
  documentReferences: string;
  notes: string;
  capacity: string;
  mileage: string;
  lastRefueling: string;
  refuelingFuel: string;
  occupancy: string;
  cardLimit: string;
  cardUsed: string;
  cardExpiry: string;
  cardNotes: string;
};

export const fuelOptions = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'GNV', 'Elétrico', 'Híbrido'];
export const vehicleCategories = ['SVO', 'Passeio', 'Van'];
export const vehicleStatuses: Vehicle['status'][] = ['Ativo', 'Manutenção', 'Inativo'];
export const emptyVehicleFields: VehicleFields = {
  plate: '',
  model: '',
  year: '',
  sector: '',
  fuel: '',
  status: 'Ativo',
  category: 'Passeio',
  crlvExpiry: '',
  insuranceExpiry: '',
  documentReferences: '',
  notes: '',
  capacity: '',
  mileage: '0',
  lastRefueling: '',
  refuelingFuel: '',
  occupancy: '0',
  cardLimit: '',
  cardUsed: '',
  cardExpiry: '',
  cardNotes: '',
};

export function vehicleToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export const normalizedPlate = (value: string) => value.trim().toUpperCase().replace(/-/g, '');
export function validPlate(value: string) {
  return /^[A-Z]{3}-?(?:\d{4}|\d[A-Z]\d{2})$/.test(value.trim().toUpperCase());
}

export function validVehicleDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Accept Brazilian currency or a decimal point; store and calculate integer cents. */
export function moneyCents(value: string): number | null {
  let text = value.trim().replace(/^R\$\s*/, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text))
    text = text.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d+(,\d{1,2})?$/.test(text)) text = text.replace(',', '.');
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) return null;
  const negative = text.startsWith('-');
  const [whole = '', decimal = ''] = text.replace('-', '').split('.');
  const cents = Number(whole + decimal.padEnd(2, '0')) * (negative ? -1 : 1);
  return Number.isSafeInteger(cents) ? cents : null;
}

export function cardBalance(values: Pick<VehicleFields, 'cardLimit' | 'cardUsed'>) {
  const limit = moneyCents(values.cardLimit);
  const used = moneyCents(values.cardUsed);
  return limit === null || used === null ? null : limit - used;
}
export const formatMoney = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

/** Demonstration only: Flex accepts gasoline/ethanol; hybrid requires a defined contract. */
export function compatibleFuel(vehicleFuel: string, refuelingFuel: string): boolean | null {
  if (!vehicleFuel || !refuelingFuel || vehicleFuel === 'Híbrido') return null;
  return vehicleFuel === 'Flex'
    ? ['Gasolina', 'Etanol', 'Flex'].includes(refuelingFuel)
    : vehicleFuel === refuelingFuel;
}

export function vehicleShiftNotice(plate: string, vehicles: Vehicle[], drivers: Driver[]) {
  const vehicle = vehicles.find(
    (record) => normalizedPlate(record.plate) === normalizedPlate(plate),
  );
  const shifts = vehicle ? drivers.filter(({ shift }) => shift?.vehicleId === vehicle.id) : [];
  return shifts.length
    ? `Existem ${shifts.length} plantão(ões) demonstrativo(s) associado(s) a essa placa. Sem intervalo de utilização neste cadastro, não é possível verificar sobreposições.`
    : 'Conflitos de utilização não verificados: este cadastro não informa data e horários de utilização. A escala continua sendo validada no cadastro de motoristas.';
}

export function validateVehicle(
  values: VehicleFields,
  vehicles: Vehicle[],
  today = vehicleToday(),
) {
  const errors: Partial<Record<keyof VehicleFields, string>> = {};
  const required = [
    'plate',
    'model',
    'year',
    'sector',
    'fuel',
    'status',
    'category',
    'crlvExpiry',
    'insuranceExpiry',
    'capacity',
    'mileage',
    'occupancy',
  ] as const;
  for (const key of required) if (!values[key].trim()) errors[key] = 'Preencha este campo.';
  if (values.plate.trim() && !validPlate(values.plate))
    errors.plate = 'Informe uma placa brasileira válida (ABC-1234 ou ABC1D23).';
  if (
    values.plate.trim() &&
    vehicles.some(({ plate }) => normalizedPlate(plate) === normalizedPlate(values.plate))
  )
    errors.plate = 'Já existe um veículo com essa placa.';
  if (
    values.year.trim() &&
    (!/^\d{4}$/.test(values.year) ||
      Number(values.year) < 1900 ||
      Number(values.year) > Number(today.slice(0, 4)) + 1)
  )
    errors.year = 'Informe um ano entre 1900 e o próximo ano.';
  if (values.fuel && !fuelOptions.includes(values.fuel))
    errors.fuel = 'Selecione um combustível da lista.';
  if (!vehicleStatuses.includes(values.status)) errors.status = 'Selecione um status da lista.';
  if (!vehicleCategories.includes(values.category))
    errors.category = 'Selecione uma categoria da lista.';
  for (const key of ['crlvExpiry', 'insuranceExpiry', 'cardExpiry'] as const) {
    if (values[key] && (!validVehicleDate(values[key]) || values[key] < today))
      errors[key] = 'Informe uma data válida, igual ou posterior à data atual.';
  }
  for (const key of ['capacity', 'mileage', 'occupancy'] as const) {
    if (
      values[key].trim() &&
      (!/^\d+$/.test(values[key]) || !Number.isSafeInteger(Number(values[key])))
    )
      errors[key] = 'Informe um número inteiro não negativo.';
  }
  if (values.capacity.trim() && !errors.capacity && Number(values.capacity) === 0)
    errors.capacity = 'A capacidade máxima deve ser maior que zero.';
  if (!errors.capacity && !errors.occupancy && Number(values.occupancy) > Number(values.capacity))
    errors.occupancy = 'A ocupação atual não pode superar a capacidade máxima.';
  if (values.refuelingFuel && !fuelOptions.includes(values.refuelingFuel))
    errors.refuelingFuel = 'Selecione um combustível da lista.';
  if (values.refuelingFuel && !values.lastRefueling.trim())
    errors.lastRefueling = 'Descreva o último abastecimento ou remova seu combustível.';
  if (values.lastRefueling.trim() && compatibleFuel(values.fuel, values.refuelingFuel) === false)
    errors.refuelingFuel = 'Abastecimento incompatível com o combustível do veículo na simulação.';
  const hasCard = Boolean(
    values.cardLimit.trim() ||
    values.cardUsed.trim() ||
    values.cardExpiry ||
    values.cardNotes.trim(),
  );
  if (hasCard) {
    for (const key of ['cardLimit', 'cardUsed', 'cardExpiry'] as const)
      if (!values[key].trim()) errors[key] = 'Preencha este campo para definir a carta.';
    for (const key of ['cardLimit', 'cardUsed'] as const) {
      const cents = moneyCents(values[key]);
      if (values[key].trim() && (cents === null || cents < 0))
        errors[key] = 'Informe um valor monetário não negativo, com até duas casas decimais.';
    }
    if (!errors.cardLimit && !errors.cardUsed && (cardBalance(values) ?? 0) < 0)
      errors.cardUsed = 'O valor usado não pode superar o limite da carta.';
  }
  return errors;
}

export function createDemoVehicle(values: VehicleFields, vehicles: Vehicle[]): Vehicle {
  return {
    id: Math.max(0, ...vehicles.map(({ id }) => id)) + 1,
    plate: normalizedPlate(values.plate),
    model: values.model.trim(),
    category: values.category,
    driver: 'Não atribuído',
    status: values.status,
    year: Number(values.year),
    sector: values.sector.trim(),
    fuel: values.fuel,
    crlvExpiry: values.crlvExpiry,
    insuranceExpiry: values.insuranceExpiry,
    documentReferences: values.documentReferences.trim(),
    notes: values.notes.trim(),
    capacity: Number(values.capacity),
    mileage: Number(values.mileage),
    occupancy: Number(values.occupancy),
    lastRefueling: values.lastRefueling.trim()
      ? { description: values.lastRefueling.trim(), fuel: values.refuelingFuel || undefined }
      : undefined,
    card: values.cardLimit.trim()
      ? {
          limitCents: moneyCents(values.cardLimit)!,
          usedCents: moneyCents(values.cardUsed)!,
          expiry: values.cardExpiry,
          notes: values.cardNotes.trim(),
        }
      : undefined,
  };
}

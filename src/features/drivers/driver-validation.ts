import type { Driver, Vehicle } from '@/features/home/types';

export type DriverFields = {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  sector: string;
  license: string;
  licenseCategory: string;
  licenseExpiry: string;
  document: string;
  linkedAccount: string;
  profile: string;
  team: string;
  date: string;
  start: string;
  end: string;
  availability: 'Disponível' | 'Indisponível';
  vehicleId: string;
};

export const emptyDriverFields: DriverFields = {
  name: '',
  cpf: '',
  phone: '',
  email: '',
  sector: '',
  license: '',
  licenseCategory: '',
  licenseExpiry: '',
  document: 'CNH',
  linkedAccount: '',
  profile: 'Motorista',
  team: '',
  date: '',
  start: '',
  end: '',
  availability: 'Disponível',
  vehicleId: '',
};

export const licenseCategories = ['A', 'B', 'AB', 'C', 'AC', 'D', 'AD', 'E', 'AE'];
export const digits = (value: string) => value.replace(/\D/g, '');

export function validCpf(value: string) {
  const cpf = digits(value);
  if (
    !/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(value.trim()) ||
    !/^\d{11}$/.test(cpf) ||
    /^(\d)\1{10}$/.test(cpf)
  )
    return false;
  return [9, 10].every((length) => {
    const sum = [...cpf.slice(0, length)].reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const check = (sum * 10) % 11;
    return Number(cpf[length]) === (check === 10 ? 0 : check);
  });
}

export function localDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}

export function validateDriver(
  values: DriverFields,
  drivers: Driver[],
  vehicles: Vehicle[],
  today = localDate(),
) {
  const errors: Partial<Record<keyof DriverFields, string>> = {};
  const required = [
    'name',
    'cpf',
    'phone',
    'email',
    'sector',
    'license',
    'licenseCategory',
    'licenseExpiry',
    'document',
    'profile',
    'availability',
  ] as const;
  required.forEach((key) => {
    if (!values[key].trim()) errors[key] = 'Preencha este campo.';
  });
  if (values.cpf && !validCpf(values.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (
    values.phone &&
    !/^\(?[1-9]\d\)?[\s.-]?(?:9\d{4}|[2-5]\d{3})[\s.-]?\d{4}$/.test(values.phone.trim())
  )
    errors.phone = 'Informe telefone com DDD e 10 ou 11 dígitos.';
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Informe um e-mail válido.';
  if (values.license && !/^\d{11}$/.test(values.license.trim()))
    errors.license = 'A CNH deve conter 11 dígitos.';
  if (values.licenseCategory && !licenseCategories.includes(values.licenseCategory))
    errors.licenseCategory = 'Selecione uma categoria válida.';
  if (values.document !== 'CNH') errors.document = 'Selecione o documento CNH.';
  if (values.profile !== 'Motorista') errors.profile = 'Selecione o perfil Motorista.';
  if (!['Disponível', 'Indisponível'].includes(values.availability))
    errors.availability = 'Selecione a disponibilidade.';
  if (values.licenseExpiry && (!validDate(values.licenseExpiry) || values.licenseExpiry < today))
    errors.licenseExpiry = 'A CNH deve estar válida na data atual.';
  if (drivers.some((driver) => driver.cpf && digits(driver.cpf) === digits(values.cpf)))
    errors.cpf = 'Já existe um motorista com esse CPF.';
  if (
    values.license.trim() &&
    drivers.some((driver) => digits(driver.license) === digits(values.license))
  )
    errors.license = 'Já existe um motorista com essa habilitação.';
  const hasShift = Boolean(
    values.team.trim() || values.date || values.start || values.end || values.vehicleId,
  );
  if (hasShift) {
    (['team', 'date', 'start', 'end'] as const).forEach((key) => {
      if (!values[key].trim()) errors[key] = 'Preencha este campo para definir o plantão.';
    });
    if (values.date && !validDate(values.date)) errors.date = 'Informe uma data válida.';
    if (
      validDate(values.date) &&
      validDate(values.licenseExpiry) &&
      values.date > values.licenseExpiry
    )
      errors.date = 'O plantão deve ocorrer antes do vencimento da CNH ou nessa data.';
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (values.start && !timePattern.test(values.start))
      errors.start = 'Informe um horário válido.';
    if (values.end && !timePattern.test(values.end)) errors.end = 'Informe um horário válido.';
    if (
      timePattern.test(values.start) &&
      timePattern.test(values.end) &&
      values.end <= values.start
    )
      errors.end = 'O fim deve ser posterior ao início no mesmo dia.';
    if (values.vehicleId && !vehicles.some((vehicle) => String(vehicle.id) === values.vehicleId))
      errors.vehicleId = 'Selecione um veículo da lista.';
    if (
      values.vehicleId &&
      !errors.date &&
      !errors.start &&
      !errors.end &&
      drivers.some(
        ({ shift }) =>
          shift?.vehicleId === Number(values.vehicleId) &&
          shift.date === values.date &&
          values.start < shift.end &&
          values.end > shift.start,
      )
    )
      errors.vehicleId = 'Este veículo já possui um plantão nesse intervalo.';
  }
  return errors;
}

export function createDemoDriver(values: DriverFields, drivers: Driver[]): Driver {
  return {
    id: Math.max(0, ...drivers.map(({ id }) => id)) + 1,
    name: values.name.trim(),
    license: values.license.trim(),
    sector: values.sector.trim(),
    status: values.availability,
    cpf: digits(values.cpf),
    phone: digits(values.phone),
    email: values.email.trim(),
    licenseCategory: values.licenseCategory,
    licenseExpiry: values.licenseExpiry,
    document: values.document,
    linkedAccount: values.linkedAccount.trim() || undefined,
    profile: values.profile,
    availability: values.availability,
    shift: values.date
      ? {
          team: values.team.trim(),
          date: values.date,
          start: values.start,
          end: values.end,
          vehicleId: values.vehicleId ? Number(values.vehicleId) : undefined,
        }
      : undefined,
  };
}

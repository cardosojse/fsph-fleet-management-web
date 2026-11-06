import { initialDrivers, initialVehicles } from '@/features/home/demo-data';
import {
  createDemoDriver,
  emptyDriverFields,
  validCpf,
  validateDriver,
  type DriverFields,
} from './driver-validation';

const valid: DriverFields = {
  ...emptyDriverFields,
  name: 'Ana Teste',
  cpf: '111.444.777-35',
  phone: '(11) 99999-1234',
  email: 'ana@example.test',
  sector: 'Operações',
  license: '99887766554',
  licenseCategory: 'B',
  licenseExpiry: '2099-12-31',
};
const check = (values: Partial<DriverFields> = {}) =>
  validateDriver({ ...valid, ...values }, initialDrivers, initialVehicles, '2026-11-06');

describe('validação do cadastro demonstrativo', () => {
  it('aceita cadastro sem plantão e normaliza identificadores', () => {
    expect(check()).toEqual({});
    const driver = createDemoDriver({ ...valid, name: ' Ana Teste ' }, initialDrivers);
    expect(driver).toMatchObject({
      id: 4,
      name: 'Ana Teste',
      cpf: '11144477735',
      phone: '11999991234',
    });
    expect(driver.shift).toBeUndefined();
  });

  it('exige os campos obrigatórios e rejeita somente espaços', () => {
    expect(Object.keys(validateDriver(emptyDriverFields, [], [], '2026-11-06'))).toHaveLength(8);
    expect(check({ name: '  ', sector: '  ' })).toMatchObject({
      name: 'Preencha este campo.',
      sector: 'Preencha este campo.',
    });
  });

  it.each(['11111111111', '11144477736', 'abc11144477735', '123'])(
    'rejeita CPF inválido %s',
    (cpf) => {
      expect(validCpf(cpf)).toBe(false);
      expect(check({ cpf }).cpf).toBeDefined();
    },
  );

  it('valida telefone, e-mail e formato da CNH', () => {
    expect(check({ phone: '123', email: 'sem-email', license: 'abc' })).toMatchObject({
      phone: expect.any(String),
      email: expect.any(String),
      license: expect.any(String),
    });
    expect(check({ phone: '(11) 3333-1234' }).phone).toBeUndefined();
  });

  it('bloqueia CPF e CNH duplicados apesar da formatação', () => {
    expect(check({ cpf: '529.982.247-25', license: '12345678901' })).toMatchObject({
      cpf: 'Já existe um motorista com esse CPF.',
      license: 'Já existe um motorista com essa habilitação.',
    });
  });

  it('rejeita CNH vencida e datas inexistentes e aceita o dia do vencimento', () => {
    expect(check({ licenseExpiry: '2026-11-05' }).licenseExpiry).toBeDefined();
    expect(check({ licenseExpiry: '2099-02-30' }).licenseExpiry).toBeDefined();
    expect(check({ licenseExpiry: '2026-11-06' })).toEqual({});
  });

  it('exige plantão completo, horários válidos e fim posterior ao início', () => {
    expect(check({ team: 'Equipe' })).toMatchObject({
      date: expect.any(String),
      start: expect.any(String),
      end: expect.any(String),
    });
    expect(
      check({ team: 'Equipe', date: '2099-06-15', start: '12:00', end: '07:00' }).end,
    ).toBeDefined();
    expect(
      check({ team: 'Equipe', date: '2099-06-15', start: '25:00', end: '26:00' }),
    ).toMatchObject({ start: expect.any(String), end: expect.any(String) });
    expect(
      check({ team: 'Equipe', date: '2099-06-15', start: '07:00', end: '07:00' }).end,
    ).toBeDefined();
  });

  it('identifica sobreposição de veículo e permite intervalos adjacentes e outros veículos', () => {
    const shift = {
      team: 'Equipe',
      date: '2099-06-15',
      start: '08:00',
      end: '13:00',
      vehicleId: '1',
    };
    expect(check(shift).vehicleId).toContain('já possui um plantão');
    expect(check({ ...shift, start: '12:00' })).toEqual({});
    expect(check({ ...shift, vehicleId: '2' })).toEqual({});
    expect(check({ ...shift, vehicleId: '999' }).vehicleId).toBeDefined();
    expect(check({ ...shift, date: '2099-06-16' })).toEqual({});
  });

  it('impede plantão após o vencimento e preserva os dados da escala ao salvar', () => {
    const shift = {
      team: 'Equipe',
      date: '2099-06-15',
      start: '12:00',
      end: '13:00',
      vehicleId: '1',
    };
    expect(check({ ...shift, licenseExpiry: '2099-06-14' }).date).toBeDefined();
    expect(createDemoDriver({ ...valid, ...shift }, initialDrivers).shift).toEqual({
      team: 'Equipe',
      date: '2099-06-15',
      start: '12:00',
      end: '13:00',
      vehicleId: 1,
    });
  });
});

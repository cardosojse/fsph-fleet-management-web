import { initialDrivers, initialVehicles } from '@/features/home/demo-data';
import {
  cardBalance,
  compatibleFuel,
  createDemoVehicle,
  emptyVehicleFields,
  moneyCents,
  normalizedPlate,
  validPlate,
  validateVehicle,
  vehicleShiftNotice,
  type VehicleFields,
} from './vehicle-validation';

const valid: VehicleFields = {
  ...emptyVehicleFields,
  plate: 'xyz-9a12',
  model: 'Renault Teste',
  year: '2023',
  sector: 'Administrativo',
  fuel: 'Diesel',
  crlvExpiry: '2099-12-31',
  insuranceExpiry: '2099-12-31',
  capacity: '4',
};
const check = (values: Partial<VehicleFields> = {}) =>
  validateVehicle({ ...valid, ...values }, initialVehicles, '2026-11-06');

describe('Validação do cadastro demonstrativo de veículos', () => {
  it.each(['SVO', 'Passeio', 'Van'])('aceita e preserva a categoria %s', (category) => {
    expect(check({ category })).toEqual({});
    expect(createDemoVehicle({ ...valid, category }, initialVehicles).category).toBe(category);
  });

  it.each(['Utilitário', 'Caminhão', 'Motocicleta', 'Outra', ''])(
    'rejeita a categoria %s',
    (category) => {
      expect(check({ category }).category).toBe('Selecione uma categoria da lista.');
    },
  );

  it('aceita cadastro sem carta nem abastecimento e preserva categoria e status', () => {
    expect(check()).toEqual({});
    expect(
      createDemoVehicle({ ...valid, model: ' Renault Teste ' }, initialVehicles),
    ).toMatchObject({
      id: 5,
      plate: 'XYZ9A12',
      model: 'Renault Teste',
      category: 'Passeio',
      driver: 'Não atribuído',
      status: 'Ativo',
      capacity: 4,
      mileage: 0,
      occupancy: 0,
    });
    expect(createDemoVehicle(valid, initialVehicles).card).toBeUndefined();
  });

  it('exige os campos obrigatórios, inclusive os preenchidos somente com espaços', () => {
    const errors = validateVehicle(emptyVehicleFields, [], '2026-11-06');
    expect(Object.keys(errors)).toHaveLength(8);
    expect(check({ plate: '   ', model: '   ', sector: '   ' })).toMatchObject({
      plate: 'Preencha este campo.',
      model: 'Preencha este campo.',
      sector: 'Preencha este campo.',
    });
  });

  it.each(['ABC-1234', 'ABC1234', 'ABC1D23', 'abc-1d23'])('aceita placa brasileira %s', (plate) =>
    expect(validPlate(plate)).toBe(true),
  );
  it.each(['ABC123', 'ABCD1234', 'ABC12D3', 'ABC--1234', 'ABC 1234', 'ABC1D234'])(
    'rejeita placa inválida %s',
    (plate) => {
      expect(validPlate(plate)).toBe(false);
      expect(check({ plate }).plate).toContain('placa brasileira válida');
    },
  );

  it('impede placas repetidas com hífen ou caixa diferentes', () => {
    expect(normalizedPlate(' abc-1d23 ')).toBe('ABC1D23');
    expect(check({ plate: ' abc1d23 ' }).plate).toBe('Já existe um veículo com essa placa.');
  });

  it('valida ano, capacidade, ocupação e quilometragem', () => {
    expect(check({ year: '2027' }).year).toBeUndefined();
    for (const year of ['1899', '2028', '2023.5', 'Infinity'])
      expect(check({ year }).year).toBeDefined();
    expect(check({ capacity: '0', mileage: '-1', occupancy: '-1' })).toMatchObject({
      capacity: expect.any(String),
      mileage: expect.any(String),
      occupancy: expect.any(String),
    });
    expect(check({ capacity: '2.5' }).capacity).toBeDefined();
    expect(check({ occupancy: '5' }).occupancy).toContain('capacidade máxima');
    expect(check({ occupancy: '4' })).toEqual({});
  });

  it('valida datas reais e vencimento; permite validade até hoje', () => {
    expect(check({ crlvExpiry: '2026-11-05', insuranceExpiry: '2099-02-30' })).toMatchObject({
      crlvExpiry: expect.any(String),
      insuranceExpiry: expect.any(String),
    });
    expect(check({ crlvExpiry: '2026-11-06', insuranceExpiry: '2026-11-06' })).toEqual({});
    expect(check({ crlvExpiry: '2099-99-99' }).crlvExpiry).toBeDefined();
  });

  it.each([
    ['1.500,00', 150000],
    ['R$ 1.500,25', 150025],
    ['1500.25', 150025],
    ['0,10', 10],
    ['1.500', 150000],
    ['-0,01', -1],
  ])('converte %s em centavos inteiros', (text, cents) =>
    expect(moneyCents(String(text))).toBe(cents),
  );
  it.each(['', 'abc', '10,001', '1.23,45', '1e3', 'Infinity', '9007199254740992'])(
    'rejeita valor monetário inválido %s',
    (value) => expect(moneyCents(value)).toBeNull(),
  );

  it('calcula saldo sem erro de ponto flutuante e exige carta completa', () => {
    expect(cardBalance({ cardLimit: '0,30', cardUsed: '0,10' })).toBe(20);
    expect(cardBalance({ cardLimit: '', cardUsed: '' })).toBeNull();
    expect(check({ cardNotes: 'Exemplo' })).toMatchObject({
      cardLimit: expect.any(String),
      cardUsed: expect.any(String),
      cardExpiry: expect.any(String),
    });
    expect(
      check({ cardLimit: '-1', cardUsed: '1', cardExpiry: '2099-12-31' }).cardLimit,
    ).toBeDefined();
    expect(
      check({ cardLimit: '10', cardUsed: '-1', cardExpiry: '2099-12-31' }).cardUsed,
    ).toBeDefined();
    expect(check({ cardLimit: '10', cardUsed: '11', cardExpiry: '2099-12-31' }).cardUsed).toContain(
      'superar o limite',
    );
    expect(
      check({ cardLimit: '10', cardUsed: '0', cardExpiry: '2020-01-01' }).cardExpiry,
    ).toBeDefined();
    const values = {
      ...valid,
      cardLimit: '1.500,00',
      cardUsed: '0,10',
      cardExpiry: '2099-12-31',
      cardNotes: 'Simulação',
    };
    expect(check(values)).toEqual({});
    expect(createDemoVehicle(values, initialVehicles).card).toEqual({
      limitCents: 150000,
      usedCents: 10,
      expiry: '2099-12-31',
      notes: 'Simulação',
    });
  });

  it('verifica combustível apenas com dados suficientes e declara casos sem regra', () => {
    expect(check({ lastRefueling: '30 litros' })).toEqual({});
    expect(compatibleFuel('Diesel', '')).toBeNull();
    expect(compatibleFuel('Híbrido', 'Gasolina')).toBeNull();
    expect(
      check({ lastRefueling: '30 litros', refuelingFuel: 'Gasolina' }).refuelingFuel,
    ).toContain('incompatível');
    expect(check({ fuel: 'Flex', lastRefueling: '30 litros', refuelingFuel: 'Etanol' })).toEqual(
      {},
    );
    expect(check({ refuelingFuel: 'Diesel' }).lastRefueling).toBeDefined();
  });

  it('informa plantões existentes sem afirmar ausência de conflito', () => {
    expect(vehicleShiftNotice('abc1d23', initialVehicles, initialDrivers)).toContain(
      '1 plantão(ões)',
    );
    expect(vehicleShiftNotice('XYZ9A12', initialVehicles, initialDrivers)).toContain(
      'não verificados',
    );
  });
});

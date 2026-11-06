import { expect, test, type Page } from '@playwright/test';

async function fillPersonal(page: Page) {
  for (const [label, value] of Object.entries({
    'Nome completo': 'Ana Cadastro',
    CPF: '111.444.777-35',
    Telefone: '(11) 99999-1234',
    'E-mail': 'ana@example.test',
    Setor: 'Operações',
    'Número da CNH': '99887766554',
    'Validade da CNH': '2099-12-31',
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('combobox', { name: /Categoria da CNH/ }).click();
  await page.getByRole('option', { name: 'B', exact: true }).click();
}

test('erros de formato, duplicidade e vencimento impedem cadastro; cancelar descarta os dados', async ({
  page,
}) => {
  await page.goto('/motoristas/novo');
  await fillPersonal(page);
  await page.getByLabel('CPF', { exact: true }).fill('123');
  await page.getByLabel('Telefone', { exact: true }).fill('123');
  await page.getByLabel('E-mail', { exact: true }).fill('invalido');
  await page.getByRole('button', { name: 'Cadastrar motorista', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Validações do cadastro' });
  await expect(panel.getByRole('link', { name: /CPF: Informe um CPF válido/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /Telefone: Informe telefone/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /E-mail: Informe um e-mail válido/ })).toBeVisible();
  await page.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
  await page.getByLabel('Número da CNH', { exact: true }).fill('12345678901');
  await page.getByLabel('Validade da CNH', { exact: true }).fill('2020-01-01');
  await page.getByRole('button', { name: 'Cadastrar motorista', exact: true }).click();
  await expect(panel.getByRole('link', { name: /CPF: Já existe um motorista/ })).toBeVisible();
  await expect(
    panel.getByRole('link', { name: /Número da CNH: Já existe um motorista/ }),
  ).toBeVisible();
  await expect(
    panel.getByRole('link', { name: /Validade da CNH: A CNH deve estar válida/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/motoristas\/novo$/);
  await page.getByRole('link', { name: 'Cancelar', exact: true }).click();
  await expect(page).toHaveURL(/motoristas$/);
  await expect(page.getByRole('cell', { name: 'Ana Cadastro', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cadastrar novo motorista' }).click();
  await expect(page.getByLabel('Nome completo', { exact: true })).toBeEmpty();
});

test('valida horários e conflito local e salva plantão completo e disponibilidade', async ({
  page,
}) => {
  await page.goto('/motoristas/novo');
  await fillPersonal(page);
  await page.getByLabel('Conta vinculada', { exact: true }).fill('Conta demonstrativa');
  await page.getByLabel('Equipe', { exact: true }).fill('Equipe de teste');
  await page.getByLabel('Data', { exact: true }).fill('2099-06-15');
  await page.getByLabel('Horário de início', { exact: true }).fill('08:00');
  await page.getByLabel('Horário de fim', { exact: true }).fill('07:00');
  await page.getByRole('combobox', { name: /Veículo/ }).click();
  await page.getByRole('option', { name: /ABC-1D23/ }).click();
  await page.getByRole('button', { name: 'Cadastrar motorista', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Validações do cadastro' });
  await expect(
    panel.getByRole('link', { name: /Horário de fim: O fim deve ser posterior/ }),
  ).toBeVisible();
  await page.getByLabel('Horário de fim', { exact: true }).fill('13:00');
  await page.getByRole('button', { name: 'Cadastrar motorista', exact: true }).click();
  await expect(
    panel.getByRole('link', { name: /Veículo: Este veículo já possui um plantão/ }),
  ).toBeVisible();
  await page.getByRole('combobox', { name: /Veículo/ }).click();
  await page.getByRole('option', { name: /DEF-4G56/ }).click();
  await page.getByRole('combobox', { name: /Disponibilidade/ }).click();
  await page.getByRole('option', { name: 'Indisponível', exact: true }).click();
  await page.getByRole('button', { name: 'Cadastrar motorista', exact: true }).click();
  await expect(page).toHaveURL(/motoristas$/);
  await expect(page.getByRole('status')).toContainText('Ana Cadastro cadastrado com sucesso');
  await page.getByRole('combobox', { name: 'Status', exact: true }).click();
  await page.getByRole('option', { name: 'Indisponível', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Ana Cadastro', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Detalhes do motorista Ana Cadastro' }).click();
  const details = page.getByRole('dialog', { name: 'Detalhes do motorista' });
  await expect(details).toContainText('Equipe de teste');
  await expect(details).toContainText('2099-06-15 · 08:00 às 13:00');
  await expect(details).toContainText('Veículo: DEF-4G56');
  await expect(details).toContainText('Conta vinculada (simulação): Conta demonstrativa');
});

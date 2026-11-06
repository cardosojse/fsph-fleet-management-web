import { expect, test, type Page } from '@playwright/test';

async function fillVehicle(page: Page) {
  for (const [label, value] of Object.entries({
    Placa: 'xyz-9a12',
    'Modelo / Marca': 'Renault Teste',
    Ano: '2023',
    Setor: 'Administrativo',
    'CRLV vigente até': '2099-12-31',
    'Seguro vigente até': '2099-12-31',
    'Capacidade máxima': '4',
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('combobox', { name: /^Combustível\s*\*?$/ }).click();
  await page.getByRole('option', { name: 'Diesel', exact: true }).click();
  await page.getByRole('combobox', { name: /Categoria/ }).click();
  await expect(page.getByRole('option')).toHaveText(['SVO', 'Passeio', 'Van']);
  await page.getByRole('option', { name: 'SVO', exact: true }).click();
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`cadastro de veículo, responsividade e teclado em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/veiculos');
    const create = page.getByRole('button', { name: /Cadastrar veículo/ });
    await create.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/veiculos\/novo$/);
    await expect(page.getByRole('heading', { name: 'Novo veículo' })).toBeFocused();
    const form = page.getByRole('form', { name: 'Cadastro de veículo' });
    await form.getByRole('button', { name: 'Cadastrar veículo', exact: true }).click();
    await expect(page.getByLabel('Placa', { exact: true })).toBeFocused();
    await fillVehicle(page);
    for (const [label, value] of Object.entries({
      'Limite da carta': '1.500,00',
      'Valor usado': '250,10',
      'Validade da carta': '2099-12-31',
      'Documentos anexos': 'CRLV e seguro (somente referência)',
      Observações: 'Exemplo de cadastro',
      'Observações da carta': 'Carta de teste',
    }))
      await page.getByLabel(label, { exact: true }).fill(value);
    await expect(page.getByLabel('Saldo disponível', { exact: true })).toHaveValue(/1\.249,90/);
    await expect(page.getByLabel('Saldo disponível', { exact: true })).toHaveAttribute('readonly');
    await page.getByLabel('Valor usado', { exact: true }).blur();
    await expect(page.getByRole('region', { name: 'Validações obrigatórias' })).toContainText(
      'Cadastro válido.',
    );
    await expect(page.getByRole('region', { name: 'Erros demonstrativos' })).toContainText(
      'Não indicam erros neste cadastro',
    );
    await expect(page.getByRole('listbox')).toHaveCount(0);
    for (const label of ['Placa', 'Modelo / Marca', 'Documentos anexos', 'Saldo disponível']) {
      const bounds = await page.getByLabel(label, { exact: true }).boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: test.info().outputPath(`novo-veiculo-${viewport.width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await form.getByRole('button', { name: 'Cadastrar veículo', exact: true }).click();
    await expect(page).toHaveURL(/veiculos$/);
    await expect(page.getByRole('status')).toContainText('XYZ9A12 cadastrado com sucesso');
    await page.getByRole('link', { name: 'Motoristas', exact: true }).click();
    await page.getByRole('link', { name: 'Veículos', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'XYZ9A12', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SVO', exact: true })).toBeVisible();
    const details = page.getByRole('button', { name: 'Detalhes do veículo XYZ9A12' });
    await details.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Detalhes do veículo' });
    await expect(dialog).toContainText('Categoria: SVO');
    await expect(dialog).toContainText('1.249,90');
    await expect(dialog).toContainText('CRLV e seguro (somente referência)');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(details).toBeFocused();
  });
}

test('cancelar o cadastro de veículo descarta os dados', async ({ page }) => {
  await page.goto('/veiculos/novo');
  await page.getByLabel('Placa', { exact: true }).fill('XYZ9A12');
  await page.getByRole('link', { name: 'Cancelar', exact: true }).click();
  await expect(page).toHaveURL(/veiculos$/);
  await expect(page.getByRole('cell', { name: 'XYZ9A12', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /Cadastrar veículo/ }).click();
  await expect(page.getByLabel('Placa', { exact: true })).toBeEmpty();
});

test('erros reais bloqueiam cadastro e o resumo permite focar o campo', async ({ page }) => {
  await page.goto('/veiculos/novo');
  await fillVehicle(page);
  for (const [label, value] of Object.entries({
    Placa: 'abc1d23',
    Ano: '9999',
    'Capacidade máxima': '0',
    'Quilometragem atual': '-1',
    'CRLV vigente até': '2020-01-01',
    'Seguro vigente até': '2020-01-01',
    'Limite da carta': '-1',
    'Valor usado': '10',
    'Validade da carta': '2020-01-01',
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Cadastrar veículo', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Validações obrigatórias' });
  for (const name of [
    /Placa: Já existe/,
    /Ano: Informe um ano/,
    /Capacidade máxima: A capacidade máxima/,
    /Quilometragem atual: Informe um número/,
    /CRLV vigente até: Informe uma data/,
    /Seguro vigente até: Informe uma data/,
    /Limite da carta: Informe um valor monetário/,
    /Validade da carta: Informe uma data/,
  ])
    await expect(panel.getByRole('link', { name })).toBeVisible();
  await panel.getByRole('link', { name: /Placa: Já existe/ }).click();
  await expect(page.getByLabel('Placa', { exact: true })).toBeFocused();
  await page.getByLabel('Placa', { exact: true }).fill('ABC');
  await page.getByLabel('Capacidade máxima', { exact: true }).fill('4');
  await page.getByLabel('Ocupação atual', { exact: true }).fill('5');
  await page.getByLabel('Limite da carta', { exact: true }).fill('10');
  await page.getByLabel('Valor usado', { exact: true }).fill('11');
  await page.getByLabel('Abastecimento (último)', { exact: true }).fill('30 litros');
  await page.getByRole('combobox', { name: /Combustível do abastecimento/ }).click();
  await page.getByRole('option', { name: 'Gasolina', exact: true }).click();
  await page.getByRole('button', { name: 'Cadastrar veículo', exact: true }).click();
  for (const name of [
    /Placa: Informe uma placa brasileira/,
    /Ocupação atual: A ocupação atual/,
    /Valor usado: O valor usado/,
    /Combustível do abastecimento: Abastecimento incompatível/,
  ])
    await expect(panel.getByRole('link', { name })).toBeVisible();
  await expect(page).toHaveURL(/veiculos\/novo$/);
});

import { expect, test } from '@playwright/test';

// Permite usar o navegador já instalado, sem baixar dependências.
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
test.skip(
  process.env.HU30_DEMO_E2E !== 'true',
  'Modo demonstrativo exige servidor de desenvolvimento expl?cito.',
);

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 820, height: 1180 },
  { width: 390, height: 844 },
]) {
  test(`HU30 responsiva ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartoes-combustivel');
    await expect(page.getByRole('heading', { name: 'Cartões de combustível' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('listagem.png'), fullPage: true });
    await page
      .getByRole('textbox', { name: 'Pesquisar por final do cartão ou placa' })
      .fill('1042');
    if (viewport.width >= 1200)
      await page
        .getByRole('table')
        .getByRole('link', { name: 'Ver detalhes do cartão •••• 1042' })
        .click();
    else await page.getByRole('article').getByRole('link', { name: 'Cartão •••• 1042' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhes do cartão' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('detalhes.png'), fullPage: true });
    await page.getByRole('button', { name: 'Cancelar cartão' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar alteração', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('link', { name: 'Voltar à listagem' }).click();
    await expect(page.getByRole('heading', { name: 'Cartões de combustível' })).toBeVisible();
  });
}

test('HU30 cadastro, edição, vínculo, desvinculação e status no navegador', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const apiCalls: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api')) apiCalls.push(request.url());
  });
  await page.goto('/cartoes-combustivel/novo');
  await page.getByLabel(/^Número do cartão/).fill('4444555566667788');
  await page.getByLabel(/^Limite total/).fill('2500,50');
  await page.getByLabel(/^Validade/).fill('2099-12');
  await page.getByRole('button', { name: 'Salvar cartão demonstrativo' }).click();
  await page
    .getByRole('table')
    .getByRole('link', { name: 'Ver detalhes do cartão •••• 7788' })
    .click();
  await page.getByRole('link', { name: 'Editar cartão' }).click();
  await page.getByLabel(/^Limite total/).fill('3750,50');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.locator('dd').filter({ hasText: '3.750,50' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Veículo demonstrativo' }).click();
  await page.getByRole('option', { name: /GHI7J89/ }).click();
  await page.getByRole('button', { name: 'Vincular veículo', exact: true }).click();
  await expect(page.locator('dd').filter({ hasText: 'GHI7J89' })).toBeVisible();
  await page.getByRole('button', { name: 'Desvincular veículo' }).click();
  await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Desvincular veículo' })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Novo status demonstrativo' }).click();
  await page.getByRole('option', { name: 'Ativo', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar alteração de status' }).click();
  await page.getByRole('button', { name: 'Confirmar alteração', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('dd').filter({ hasText: /^Ativo$/ })).toBeVisible();
  expect(apiCalls).toEqual([]);
});

for (const width of [1440, 390]) {
  test(`HU30 filtro e setor SVO ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/cartoes-combustivel');
    await page.getByRole('combobox', { name: 'Setor', exact: true }).click();
    await page
      .getByRole('option', { name: 'SVO — Serviço de Verificação de Óbito', exact: true })
      .click();
    if (width === 1440) {
      await expect(page.getByRole('table').getByRole('row')).toHaveCount(4);
      await page
        .getByRole('table')
        .getByRole('link', { name: 'Ver detalhes do cartão •••• 4101' })
        .click();
    } else {
      await expect(page.getByRole('article')).toHaveCount(3);
      await page.getByRole('article').filter({ hasText: '4101' }).getByRole('link').click();
    }
    await expect(page.getByRole('heading', { name: 'Detalhes do cartão' })).toBeVisible();
    await expect(
      page.locator('dd').filter({ hasText: /^SVO — Serviço de Verificação de Óbito$/ }),
    ).toBeVisible();
    await expect(
      page.locator('dd').filter({ hasText: 'SVO-DEMO-01 · Chevrolet S10 (sem placa real)' }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
  });
}

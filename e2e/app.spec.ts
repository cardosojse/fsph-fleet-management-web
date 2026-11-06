import { expect, test } from '@playwright/test';

test('navega entre as paginas independentes', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/motoristas$/);
  await expect(page.getByRole('heading', { name: 'Motoristas', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Veículos' }).click();
  await expect(page).toHaveURL(/veiculos$/);
  await expect(page.getByRole('heading', { name: 'Veículos', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('link', { name: 'Motoristas' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
]) {
  test(`fluxos e teclado em ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/veiculos');
    const search = page.getByRole('textbox', { name: 'Pesquisar' });
    await search.fill('Fiat');
    await page.getByRole('combobox', { name: 'Status', exact: true }).click();
    await page.getByRole('option', { name: 'Manutenção' }).click();
    await expect(page.getByRole('cell', { name: 'GHI-7J89', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'ABC-1D23', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    const details = page.getByRole('button', { name: 'Detalhes do veículo ABC-1D23' });
    // Reach the details action using Tab, then activate it with Enter.
    await search.focus();
    for (
      let step = 0;
      step < 12 && !(await details.evaluate((element) => element === document.activeElement));
      step++
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(details).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Detalhes do veículo' });
    await expect(dialog.getByText('Modelo: Fiat Argo')).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath(`detalhes-${viewport.width}.png`),
      fullPage: true,
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(details).toBeFocused();
    await page.screenshot({
      path: test.info().outputPath(`veiculos-${viewport.width}.png`),
      fullPage: true,
    });

    await page.getByRole('link', { name: 'Motoristas' }).click();
    await page.getByRole('combobox', { name: 'Setor', exact: true }).click();
    await page.getByRole('option', { name: 'Operações' }).click();
    await page.getByRole('combobox', { name: 'Status', exact: true }).click();
    await page.getByRole('option', { name: 'Em rota' }).click();
    await expect(page.getByText('Nenhum resultado para os filtros selecionados.')).toBeVisible();
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    await expect(page.getByRole('cell', { name: 'Maria Santos', exact: true })).toBeVisible();
    for (const control of [
      search,
      page.getByRole('combobox', { name: 'Setor', exact: true }),
      page.getByRole('combobox', { name: 'Status', exact: true }),
      page.getByRole('button', { name: 'Limpar filtros' }),
    ]) {
      const bounds = await control.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`motoristas-${viewport.width}.png`),
      fullPage: true,
    });

    await page.getByRole('button', { name: 'Cadastrar novo motorista' }).click();
    await expect(page).toHaveURL(/motoristas\/novo$/);
    const form = page.getByRole('form', { name: 'Cadastro de motorista' });
    await form.getByRole('button', { name: 'Cadastrar motorista' }).click();
    await expect(form.getByRole('textbox', { name: 'Nome completo', exact: true })).toBeFocused();
    await form.getByLabel('Nome completo', { exact: true }).fill('Teste E2E');
    await form.getByLabel('CPF', { exact: true }).fill('111.444.777-35');
    await form.getByLabel('Telefone', { exact: true }).fill('(11) 99999-1234');
    await form.getByLabel('E-mail', { exact: true }).fill('e2e@example.test');
    await form.getByLabel('Setor', { exact: true }).fill('Operacoes');
    await form.getByLabel('Número da CNH', { exact: true }).fill('99887766554');
    await form.getByLabel('Validade da CNH', { exact: true }).fill('2099-12-31');
    await form.getByRole('combobox', { name: /Categoria da CNH/ }).click();
    await page.getByRole('option', { name: 'B', exact: true }).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      animations: 'disabled',
      path: test.info().outputPath(`cadastro-${viewport.width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await form.getByRole('button', { name: 'Cadastrar motorista' }).click();
    await expect(page).toHaveURL(/motoristas$/);
    await expect(page.getByRole('cell', { name: 'Teste E2E', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Veículos' }).click();
    await page.getByRole('link', { name: 'Motoristas' }).click();
    await expect(page.getByRole('cell', { name: 'Teste E2E', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Detalhes do motorista Teste E2E' }).click();
    await expect(page.getByRole('dialog', { name: 'Detalhes do motorista' })).toContainText(
      '99887766554',
    );
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Detalhes do motorista Teste E2E' }),
    ).toBeFocused();
  });
}

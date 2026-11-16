import { expect, test } from '@playwright/test';
test.use({ channel: process.env.PLAYWRIGHT_CHANNEL });
for (const path of [
  '/cartoes-combustivel',
  '/cartoes-combustivel/novo',
  '/cartoes-combustivel/demo-1',
  '/cartoes-combustivel/demo-1/editar',
]) {
  test(`HU30 sem mocks em produção: ${path}`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api')) requests.push(request.url());
    });
    await page.goto(path);
    await expect(page.getByRole('status')).toContainText('Integração indisponível');
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByText('•••• 1042', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Salvar|Vincular|Confirmar/ })).toHaveCount(0);
    if (path !== '/cartoes-combustivel') {
      await page.getByRole('link', { name: 'Voltar à listagem' }).click();
      await expect(page).toHaveURL(/\/cartoes-combustivel$/);
    }
    expect(requests).toEqual([]);
  });
}

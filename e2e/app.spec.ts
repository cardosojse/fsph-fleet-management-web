import { expect, test } from '@playwright/test';

test('exibe a fundação do sistema', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Gestão de Frotas' })).toBeVisible();
  await expect(page.getByText(/infraestrutura do frontend pronta/i)).toBeVisible();
});

test('abre um caminho SPA diretamente e retorna ao início', async ({ page }) => {
  await page.goto('/rota-de-homologacao-inexistente');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page.getByRole('heading', { name: 'Gestão de Frotas' })).toBeVisible();
});

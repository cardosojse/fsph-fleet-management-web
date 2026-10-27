import { expect, test } from '@playwright/test';

test('exibe a fundação do sistema', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Gestão de Frotas' })).toBeVisible();
  await expect(page.getByText(/infraestrutura do frontend pronta/i)).toBeVisible();
});

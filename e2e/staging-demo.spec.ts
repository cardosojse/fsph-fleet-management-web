import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test('demo autentica pela interface, acessa rota protegida e revoga o JWT', async ({ page }) => {
  const api = process.env.STAGING_API_URL;
  const password = process.env.STAGING_DEMO_PASSWORD;
  test.skip(!api || !password, 'Requires an isolated staging API and its demonstration password.');
  test.setTimeout(180_000);

  await page.goto('/conta');
  await expect(page).toHaveURL(/\/login$/);
  const email = page.getByLabel('E-mail');
  await expect(email).toHaveValue('demo@frota.test');
  await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('');
  await expect(page.getByText(/Homologação: use o e-mail de demonstração/)).toBeVisible();
  await page.getByLabel('Senha', { exact: true }).fill(password!);
  const login = page.waitForResponse(`${api}/api/v1/auth/login`);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  const loginResponse = await login;
  expect(loginResponse.status()).toBe(200);
  const { accessToken } = (await loginResponse.json()) as { accessToken: string };
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
  await expect(page.getByText('demo@frota.test', { exact: true }).first()).toBeVisible();

  const identity = await page.evaluate(
    async ({ api, accessToken }) => {
      const response = await fetch(`${api}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return { status: response.status };
      const user = await response.json();
      return { status: response.status, email: user.email, role: user.role };
    },
    { api: api!, accessToken },
  );
  expect(identity).toEqual({ status: 200, email: 'demo@frota.test', role: 'ADMIN' });

  const logout = page.waitForResponse(`${api}/api/v1/auth/logout`);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  expect((await logout).status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/);
  const revoked = await page.evaluate(
    async ({ api, accessToken }) => {
      const response = await fetch(`${api}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.status;
    },
    { api: api!, accessToken },
  );
  expect(revoked).toBe(401);
  await page.goto('/conta');
  await expect(page).toHaveURL(/\/login$/);
});

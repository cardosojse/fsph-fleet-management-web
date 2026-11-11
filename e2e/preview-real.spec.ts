import { mkdirSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off' });

test('conecta login, todas as telas existentes e CRUD à API real isolada', async ({ page }) => {
  test.setTimeout(180_000);
  const api = process.env.PREVIEW_REAL_API;
  const email = process.env.STAGING_ADMIN_EMAIL;
  const password = process.env.STAGING_ADMIN_PASSWORD;
  test.skip(!api || !email || !password, 'Requires the isolated preview API and credentials.');
  const fixture = JSON.parse(
    readFileSync(
      process.env.PREVIEW_FIXTURE_PATH ?? '.deploy-validation/preview-fixture.json',
      'utf8',
    ),
  ) as { vehicleId: string; driverId: string; transportId: string; routeId: string };
  const screenshots = process.env.PREVIEW_SCREENSHOT_DIR ?? '.deploy-validation/screenshots';
  mkdirSync(screenshots, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/veiculos');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await page.screenshot({ path: `${screenshots}/login.png`, fullPage: true });
  await page.getByLabel('E-mail').fill(email!);
  await page.getByLabel('Senha', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Veículos', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'FSP0A06' })).toBeVisible();

  const screens: [string, RegExp, string][] = [
    ['/', /^Gestão de Frotas$/, '/api/v1/auth/me'],
    ['/conta', /^Minha conta$/, '/api/v1/auth/me'],
    ['/setores', /^Setores$/, '/api/v1/sectors'],
    ['/usuarios', /^Usuários$/, '/api/v1/users'],
    ['/veiculos', /^Veículos$/, '/api/v1/vehicles'],
    [
      `/veiculos/${fixture.vehicleId}/documentos`,
      /^Documentos/,
      `/api/v1/vehicles/${fixture.vehicleId}/documents`,
    ],
    ['/motoristas', /^Motoristas$/, '/api/v1/drivers'],
    [
      `/motoristas/${fixture.driverId}/cnhs`,
      /^CNHs/,
      `/api/v1/drivers/${fixture.driverId}/licenses`,
    ],
    ['/transportes', /^Transportes$/, '/api/v1/transports'],
    [
      `/transportes/${fixture.transportId}`,
      /^Detalhes do transporte$/,
      `/api/v1/transports/${fixture.transportId}`,
    ],
    ['/viagens', /^Viagens$/, '/api/v1/routes'],
    [`/viagens/${fixture.routeId}`, /^Detalhes da viagem$/, `/api/v1/routes/${fixture.routeId}`],
    ['/permissoes', /^Permissões$/, '/api/v1/roles/permissions'],
  ];
  for (const [index, [path, heading, endpoint]] of screens.entries()) {
    await test.step(`Tela ${path} e GET ${endpoint}`, async () => {
      const response = page.waitForResponse(
        (result) =>
          result.url().startsWith(api!) &&
          new URL(result.url()).pathname === endpoint &&
          result.request().method() === 'GET',
      );
      await page.goto(path);
      expect((await response).status()).toBe(200);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      await expect(page.locator('.MuiAlert-standardError')).toHaveCount(0);
      await page.screenshot({ path: `${screenshots}/tela-${index + 1}.png`, fullPage: true });
    });
  }

  await page.goto('/setores');
  const name = `UI preview ${randomUUID()}`;
  let temporaryId: string | undefined;
  try {
    await page.getByRole('button', { name: 'Novo setor', exact: true }).click();
    await page.getByRole('dialog').getByLabel('Nome do setor').fill(name);
    const created = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/v1/sectors' &&
        response.request().method() === 'POST',
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    const createdResponse = await created;
    expect(createdResponse.status()).toBe(201);
    temporaryId = ((await createdResponse.json()) as { id: string }).id;
    const row = page.getByRole('row').filter({ hasText: name });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Excluir' }).click();
    const removed = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/sectors/${temporaryId}`) &&
        response.request().method() === 'DELETE',
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    expect((await removed).status()).toBe(204);
    temporaryId = undefined;
    await expect(row).toHaveCount(0);
  } finally {
    if (temporaryId) {
      const token = await page.evaluate(() =>
        sessionStorage.getItem('fsph-fleet-management.access-token'),
      );
      const removed = await page.request.delete(`${api}/api/v1/sectors/${temporaryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(removed.status()).toBe(204);
    }
  }
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

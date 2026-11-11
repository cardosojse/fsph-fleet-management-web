import { expect, test } from '@playwright/test';

test('exige login para acessar as telas', async ({ page }) => {
  await page.goto('/veiculos');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Gestão de Frotas' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('autentica, lista veículos e registra documento', async ({ page }) => {
  const documents: object[] = [];
  const vehicle = {
    id: 'v1',
    sectorId: null,
    plate: 'ABC1D23',
    model: 'Van',
    capacity: 8,
    usageType: 'Coleta',
    currentOdometerKm: 1200,
    active: true,
  };
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/auth/login')) {
      expect(request.postDataJSON()).toEqual({
        email: 'admin@fsph.test',
        password: 'senha-segura',
      });
      return route.fulfill({
        json: { accessToken: 'e2e-token', tokenType: 'Bearer', expiresIn: 3600 },
      });
    }
    expect(request.headers().authorization).toBe('Bearer e2e-token');
    if (path.endsWith('/auth/me'))
      return route.fulfill({
        json: { id: 'u1', sectorId: 's1', name: 'Admin', email: 'admin@fsph.test', role: 'ADMIN' },
      });
    if (path.endsWith('/sectors')) return route.fulfill({ json: [] });
    if (path.endsWith('/vehicles/v1/documents')) {
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        expect(body).toEqual({
          type: 'LICENSING',
          documentNumber: 'DOC-2026',
          issuedOn: '2026-11-01',
          expiresOn: '2027-11-01',
        });
        documents.push({
          ...body,
          id: 'doc1',
          vehicleId: 'v1',
          status: 'ACTIVE',
          expired: false,
          expiringWithin30Days: false,
        });
        return route.fulfill({ status: 201, json: documents[0] });
      }
      return route.fulfill({ json: documents });
    }
    if (path.endsWith('/vehicles/v1')) return route.fulfill({ json: vehicle });
    if (path.endsWith('/vehicles')) return route.fulfill({ json: [vehicle] });
    throw new Error(`Requisição inesperada: ${request.method()} ${path}`);
  });
  await page.goto('/veiculos');
  await page.getByLabel('E-mail').fill('admin@fsph.test');
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Veículos' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'ABC1D23' })).toBeVisible();
  await page.getByRole('link', { name: 'Documentos' }).click();
  await page.getByRole('button', { name: 'Registrar documento' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Tipo' }).click();
  await page.getByRole('option', { name: 'Licenciamento' }).click();
  await dialog.getByLabel('Número do documento').fill('DOC-2026');
  await dialog.getByLabel('Data de emissão').fill('2026-11-01');
  await dialog.getByLabel('Validade').fill('2027-11-01');
  await dialog.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('cell', { name: 'DOC-2026' })).toBeVisible();
});

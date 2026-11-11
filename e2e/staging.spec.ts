import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off' });

test('autentica pelo navegador contra a API de homologação', async ({ page }) => {
  const api = process.env.STAGING_API_URL;
  const email = process.env.STAGING_ADMIN_EMAIL;
  const password = process.env.STAGING_ADMIN_PASSWORD;
  test.skip(!api || !email || !password, 'Requires an isolated staging API and its credentials.');
  await page.goto('/');

  const result = await page.evaluate(
    async ({ api, email, password }) => {
      const unauthenticated = await fetch(`${api}/api/v1/auth/me`);
      const login = await fetch(`${api}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!login.ok) return { login: login.status };
      const { accessToken } = await login.json();
      const headers = { Authorization: `Bearer ${accessToken}` };
      const me = await fetch(`${api}/api/v1/auth/me`, { headers });
      const user = await me.json();
      const logout = await fetch(`${api}/api/v1/auth/logout`, { method: 'POST', headers });
      const revoked = await fetch(`${api}/api/v1/auth/me`, { headers });
      return {
        unauthenticated: unauthenticated.status,
        login: login.status,
        me: me.status,
        role: user.role,
        logout: logout.status,
        revoked: revoked.status,
      };
    },
    { api: api!, email: email!, password: password! },
  );

  expect(result).toEqual({
    unauthenticated: 401,
    login: 200,
    me: 200,
    role: 'ADMIN',
    logout: 204,
    revoked: 401,
  });
});

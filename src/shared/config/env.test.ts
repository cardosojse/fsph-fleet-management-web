import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API deployment configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', undefined);
    vi.stubEnv('VITE_API_BASE_URL', undefined);
    vi.stubEnv('VITE_APP_ENV', undefined);
  });

  afterEach(() => vi.unstubAllEnvs());

  it('preserves the local proxy default', async () => {
    const { env } = await import('./env');
    expect(env.apiBaseUrl).toBe('/api');
    expect(env.isStaging).toBe(false);
  });

  it('preserves the existing environment variable', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://legacy.example.invalid/');
    const { env } = await import('./env');
    expect(env.apiBaseUrl).toBe('https://legacy.example.invalid');
  });

  it('uses the Render origin configured for Vercel', async () => {
    vi.stubEnv('VITE_API_URL', 'https://staging.example.invalid///');
    vi.stubEnv('VITE_API_BASE_URL', '/api');
    const { env } = await import('./env');
    expect(env.apiBaseUrl).toBe('https://staging.example.invalid');
  });

  it('rejects an explicitly empty API URL', async () => {
    vi.stubEnv('VITE_API_URL', '  ');
    await expect(import('./env')).rejects.toThrow();
  });

  it('enables the demonstration email only for an explicit staging build', async () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    const { env } = await import('./env');
    expect(env.isStaging).toBe(true);
  });

  it.each(['production', 'development'])('disables the demonstration email in %s', async (mode) => {
    vi.stubEnv('VITE_APP_ENV', mode);
    const { env } = await import('./env');
    expect(env.isStaging).toBe(false);
  });
});

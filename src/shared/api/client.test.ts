import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('deployed API client', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    vi.stubEnv('VITE_API_URL', 'https://staging.example.invalid');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: 'Staging' }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the existing session JWT to the configured backend', async () => {
    const { authToken } = await import('./auth-token');
    const { apiClient } = await import('./client');
    authToken.set('staging-test-jwt');
    // The main branch intentionally has an empty generated OpenAPI contract.
    await apiClient.GET('/api/v1/auth/me' as never);
    expect(fetch).toHaveBeenCalledTimes(1);
    const request = vi.mocked(fetch).mock.calls[0]?.[0] as Request;
    expect(request.url).toBe('https://staging.example.invalid/api/v1/auth/me');
    expect(request.headers.get('Authorization')).toBe('Bearer staging-test-jwt');
  });

  it('does not send a token after the session is cleared', async () => {
    const { authToken } = await import('./auth-token');
    const { apiClient } = await import('./client');
    authToken.set('staging-test-jwt');
    authToken.clear();
    await apiClient.GET('/api/v1/auth/me' as never);
    expect(fetch).toHaveBeenCalledTimes(1);
    const request = vi.mocked(fetch).mock.calls[0]?.[0] as Request;
    expect(request.headers.get('Authorization')).toBeNull();
  });
});

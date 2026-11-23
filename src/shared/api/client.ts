import createClient from 'openapi-fetch';

import type { paths } from '@/shared/api/generated/schema';
import { authToken } from '@/shared/api/auth-token';
import { env } from '@/shared/config/env';

// OpenAPI paths already include /api. Preserve a deployment prefix without duplicating it.
const baseUrl = new URL(env.apiBaseUrl, window.location.origin).href
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
export const apiClient = createClient<paths>({
  baseUrl,
  fetch: (request) => globalThis.fetch(request),
});

function authorize(request: Request) {
  const token = authToken.get();
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
  if (!request.headers.has('Accept')) {
    request.headers.set('Accept', 'application/json, application/problem+json');
  }
  return request;
}

function handleUnauthorized(request: Request, response: Response) {
  const token = authToken.get();
  if (
    response.status === 401 &&
    token &&
    request.headers.get('Authorization') === `Bearer ${token}` &&
    !new URL(request.url).pathname.endsWith('/auth/login')
  ) {
    authToken.clear();
  }
}

export async function apiRequest(path: string, init: RequestInit = {}) {
  const request = authorize(new Request(`${baseUrl}${path}`, { ...init, cache: 'no-store' }));
  const response = await fetch(request);
  handleUnauthorized(request, response);
  return response;
}

apiClient.use({
  onRequest: ({ request }) => authorize(request),
  onResponse: ({ request, response }) => handleUnauthorized(request, response),
});

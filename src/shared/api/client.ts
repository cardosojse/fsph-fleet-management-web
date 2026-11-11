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

apiClient.use({
  async onRequest({ request }) {
    const token = authToken.get();

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    request.headers.set('Accept', 'application/json, application/problem+json');
    return request;
  },
  onResponse({ request, response }) {
    if (
      response.status === 401 &&
      authToken.get() &&
      request.headers.get('Authorization') === `Bearer ${authToken.get()}` &&
      !new URL(request.url).pathname.endsWith('/auth/login')
    ) {
      authToken.clear();
    }
  },
});

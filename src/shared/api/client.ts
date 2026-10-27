import createClient from 'openapi-fetch';

import type { paths } from '@/shared/api/generated/schema';
import { authToken } from '@/shared/api/auth-token';
import { env } from '@/shared/config/env';

export const apiClient = createClient<paths>({ baseUrl: env.apiBaseUrl });

apiClient.use({
  async onRequest({ request }) {
    const token = authToken.get();

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    request.headers.set('Accept', 'application/json, application/problem+json');
    return request;
  },
});

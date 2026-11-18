import createClient from 'openapi-fetch';

import type { paths } from '@/shared/api/generated/schema';
import { authToken } from '@/shared/api/auth-token';
import { env } from '@/shared/config/env';
import { parseProblemDetail } from '@/shared/api/problem-detail';

const apiOrigin = new URL(env.apiBaseUrl, window.location.origin).href.replace(/\/api$/, '');
export const apiClient = createClient<paths>({
  baseUrl: apiOrigin,
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
});

export function apiData<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.response.ok && result.data !== undefined) return result.data;
  const message = {
    401: 'A API exige uma sessão válida para exibir estes dados.',
    403: 'Sua conta não tem permissão para acessar estes dados.',
  }[result.response.status];
  throw new Response(
    message ?? parseProblemDetail(result.error).detail ?? 'A API não retornou os dados esperados.',
    {
      status: result.response.ok ? 502 : result.response.status,
    },
  );
}

export async function apiErrorMessage(error: unknown) {
  return error instanceof Response ? error.clone().text() : 'Não foi possível conectar à API.';
}

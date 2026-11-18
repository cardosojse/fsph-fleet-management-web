import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { authToken } from './auth-token';
import { apiClient, apiData } from './client';
import type { components } from './generated/schema';

export type ApiUser = {
  name: string;
  initials: string;
  role?: string;
  permissions: NonNullable<components['schemas']['CurrentUserResponse']['permissions']>;
  logout: () => void;
};

export function useApiSession(): ApiUser | undefined {
  const cache = useQueryClient();
  const [token, setToken] = useState(authToken.get);
  const me = useQuery({
    queryKey: ['api-session'],
    enabled: Boolean(token),
    queryFn: async ({ signal }) => apiData(await apiClient.GET('/api/v1/auth/me', { signal })),
  });
  async function logout() {
    try {
      await apiClient.POST('/api/v1/auth/logout');
    } finally {
      authToken.clear();
      setToken(null);
      await cache.resetQueries();
    }
  }

  if (token && me.data && !me.isError) {
    const name = me.data.name?.trim() || 'Conta autenticada';
    return {
      name,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toLocaleUpperCase('pt-BR'),
      role: me.data.role,
      permissions: me.data.permissions ?? [],
      logout: () => void logout().catch(() => undefined),
    };
  }

  return undefined;
}

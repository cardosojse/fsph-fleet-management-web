import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';

import { authToken } from '@/shared/api/auth-token';
import { authApi } from './api';

export function useSession() {
  const token = useSyncExternalStore(authToken.subscribe, authToken.get, () => null);
  const session = useQuery({
    queryKey: ['session', token],
    queryFn: ({ signal }) => authApi.me(signal),
    enabled: Boolean(token),
    retry: false,
  });
  return { token, ...session };
}

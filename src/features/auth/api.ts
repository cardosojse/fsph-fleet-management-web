import { apiClient } from '@/shared/api/client';
import { result } from '@/shared/api/result';
import type { Dto } from '@/shared/api/types';

export const authApi = {
  login: (body: Dto['LoginRequest']) => result(apiClient.POST('/api/v1/auth/login', { body })),
  me: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/auth/me', { signal })),
  logout: () => result(apiClient.POST('/api/v1/auth/logout')),
  changePassword: (body: Dto['ChangePasswordRequest']) =>
    result(apiClient.PATCH('/api/v1/users/me/password', { body })),
};

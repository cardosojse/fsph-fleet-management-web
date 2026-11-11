import { apiClient } from '@/shared/api/client';
import { result } from '@/shared/api/result';
import type { Dto, UserRole } from '@/shared/api/types';

export const permissionsApi = {
  list: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/roles/permissions', { signal })),
  find: (role: UserRole, signal?: AbortSignal) =>
    result(
      apiClient.GET('/api/v1/roles/{role}/permissions', { params: { path: { role } }, signal }),
    ),
  replace: (role: UserRole, body: Dto['ReplacePermissionsRequest']) =>
    result(apiClient.PUT('/api/v1/roles/{role}/permissions', { params: { path: { role } }, body })),
};

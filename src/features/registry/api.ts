import { apiClient } from '@/shared/api/client';
import { result } from '@/shared/api/result';
import type { Dto } from '@/shared/api/types';

export const sectorsApi = {
  list: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/sectors', { signal })),
  find: (id: string) => result(apiClient.GET('/api/v1/sectors/{id}', { params: { path: { id } } })),
  create: (body: Dto['CreateSectorRequest']) => result(apiClient.POST('/api/v1/sectors', { body })),
  update: (id: string, body: Dto['UpdateSectorRequest']) =>
    result(apiClient.PUT('/api/v1/sectors/{id}', { params: { path: { id } }, body })),
  remove: (id: string) =>
    result(apiClient.DELETE('/api/v1/sectors/{id}', { params: { path: { id } } })),
};
export const usersApi = {
  list: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/users', { signal })),
  find: (id: string) => result(apiClient.GET('/api/v1/users/{id}', { params: { path: { id } } })),
  create: (body: Dto['CreateUserRequest']) => result(apiClient.POST('/api/v1/users', { body })),
  update: (id: string, body: Dto['UpdateUserRequest']) =>
    result(apiClient.PUT('/api/v1/users/{id}', { params: { path: { id } }, body })),
  deactivate: (id: string) =>
    result(apiClient.DELETE('/api/v1/users/{id}', { params: { path: { id } } })),
  reactivate: (id: string) =>
    result(apiClient.PATCH('/api/v1/users/{id}/reactivate', { params: { path: { id } } })),
  password: (id: string, body: Dto['UpdateUserPasswordRequest']) =>
    result(apiClient.PATCH('/api/v1/users/{id}/password', { params: { path: { id } }, body })),
};
export const vehiclesApi = {
  list: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/vehicles', { signal })),
  find: (id: string) =>
    result(apiClient.GET('/api/v1/vehicles/{id}', { params: { path: { id } } })),
  create: (body: Dto['CreateVehicleRequest']) =>
    result(apiClient.POST('/api/v1/vehicles', { body })),
  update: (id: string, body: Dto['UpdateVehicleRequest']) =>
    result(apiClient.PUT('/api/v1/vehicles/{id}', { params: { path: { id } }, body })),
  deactivate: (id: string) =>
    result(apiClient.DELETE('/api/v1/vehicles/{id}', { params: { path: { id } } })),
  documents: (id: string, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/vehicles/{id}/documents', { params: { path: { id } }, signal })),
  document: (id: string, documentId: string) =>
    result(
      apiClient.GET('/api/v1/vehicles/{id}/documents/{documentId}', {
        params: { path: { id, documentId } },
      }),
    ),
  registerDocument: (id: string, body: Dto['RegisterVehicleDocumentRequest']) =>
    result(apiClient.POST('/api/v1/vehicles/{id}/documents', { params: { path: { id } }, body })),
};
export const driversApi = {
  list: (signal?: AbortSignal) => result(apiClient.GET('/api/v1/drivers', { signal })),
  find: (id: string) => result(apiClient.GET('/api/v1/drivers/{id}', { params: { path: { id } } })),
  create: (body: Dto['CreateDriverRequest']) => result(apiClient.POST('/api/v1/drivers', { body })),
  deactivate: (id: string) =>
    result(apiClient.DELETE('/api/v1/drivers/{id}', { params: { path: { id } } })),
  licenses: (id: string, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/drivers/{id}/licenses', { params: { path: { id } }, signal })),
  license: (id: string, licenseId: string) =>
    result(
      apiClient.GET('/api/v1/drivers/{id}/licenses/{licenseId}', {
        params: { path: { id, licenseId } },
      }),
    ),
  registerLicense: (id: string, body: Dto['RegisterDriverLicenseRequest']) =>
    result(apiClient.POST('/api/v1/drivers/{id}/licenses', { params: { path: { id } }, body })),
};

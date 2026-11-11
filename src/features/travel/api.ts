import { apiClient } from '@/shared/api/client';
import { result } from '@/shared/api/result';
import type { Dto } from '@/shared/api/types';

export type TransportFilters = {
  page: number;
  size: number;
  status?: Dto['TransportStatus'];
  sectorId?: string;
};
export type RouteFilters = {
  page: number;
  size: number;
  status?: Dto['RouteStatus'];
  vehicleId?: string;
  driverId?: string;
};
export const transportsApi = {
  list: (query: TransportFilters, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/transports', { params: { query }, signal })),
  find: (id: string, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/transports/{id}', { params: { path: { id } }, signal })),
  create: (body: Dto['CreateTransportRequest']) =>
    result(apiClient.POST('/api/v1/transports', { body })),
  cancel: (id: string) =>
    result(apiClient.POST('/api/v1/transports/{id}/cancel', { params: { path: { id } } })),
};
export const routesApi = {
  list: (query: RouteFilters, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/routes', { params: { query }, signal })),
  find: (id: string, signal?: AbortSignal) =>
    result(apiClient.GET('/api/v1/routes/{id}', { params: { path: { id } }, signal })),
  create: (body: Dto['CreateRouteRequest']) => result(apiClient.POST('/api/v1/routes', { body })),
  schedule: (routeId: string, body: Dto['UpdateRouteScheduleRequest']) =>
    result(
      apiClient.PUT('/api/v1/routes/{routeId}/schedule', { params: { path: { routeId } }, body }),
    ),
  start: (routeId: string, body: Dto['StartRouteRequest']) =>
    result(
      apiClient.POST('/api/v1/routes/{routeId}/start', { params: { path: { routeId } }, body }),
    ),
  complete: (routeId: string, body: Dto['CompleteRouteRequest']) =>
    result(
      apiClient.POST('/api/v1/routes/{routeId}/complete', { params: { path: { routeId } }, body }),
    ),
  cancel: (routeId: string) =>
    result(apiClient.POST('/api/v1/routes/{routeId}/cancel', { params: { path: { routeId } } })),
  stops: (routeId: string, signal?: AbortSignal) =>
    result(
      apiClient.GET('/api/v1/routes/{routeId}/stops', { params: { path: { routeId } }, signal }),
    ),
  stop: (routeId: string, stopId: string) =>
    result(
      apiClient.GET('/api/v1/routes/{routeId}/stops/{stopId}', {
        params: { path: { routeId, stopId } },
      }),
    ),
  addStop: (routeId: string, body: Dto['AddRouteStopRequest']) =>
    result(
      apiClient.POST('/api/v1/routes/{routeId}/stops', { params: { path: { routeId } }, body }),
    ),
  completeStop: (routeId: string, stopId: string) =>
    result(
      apiClient.POST('/api/v1/routes/{routeId}/stops/{stopId}/complete', {
        params: { path: { routeId, stopId } },
      }),
    ),
  cancelStop: (routeId: string, stopId: string) =>
    result(
      apiClient.POST('/api/v1/routes/{routeId}/stops/{stopId}/cancel', {
        params: { path: { routeId, stopId } },
      }),
    ),
};

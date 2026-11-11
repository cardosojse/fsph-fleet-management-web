import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/features/home/HomePage';
import { AppLayout } from '@/app/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'conta',
        lazy: async () => ({
          Component: (await import('@/features/auth/AccountPage')).AccountPage,
        }),
      },
      {
        path: 'setores',
        lazy: async () => ({
          Component: (await import('@/features/registry/RegistryPages')).SectorsPage,
        }),
      },
      {
        path: 'usuarios',
        lazy: async () => ({
          Component: (await import('@/features/registry/RegistryPages')).UsersPage,
        }),
      },
      {
        path: 'veiculos',
        lazy: async () => ({
          Component: (await import('@/features/registry/RegistryPages')).VehiclesPage,
        }),
      },
      {
        path: 'veiculos/:id/documentos',
        lazy: async () => ({
          Component: (await import('@/features/registry/DocumentsPage')).VehicleDocumentsPage,
        }),
      },
      {
        path: 'motoristas',
        lazy: async () => ({
          Component: (await import('@/features/registry/RegistryPages')).DriversPage,
        }),
      },
      {
        path: 'motoristas/:id/cnhs',
        lazy: async () => ({
          Component: (await import('@/features/registry/DocumentsPage')).DriverLicensesPage,
        }),
      },
      {
        path: 'transportes',
        lazy: async () => ({
          Component: (await import('@/features/travel/TransportsPage')).TransportsPage,
        }),
      },
      {
        path: 'transportes/:id',
        lazy: async () => ({
          Component: (await import('@/features/travel/TransportsPage')).TransportDetailPage,
        }),
      },
      {
        path: 'viagens',
        lazy: async () => ({
          Component: (await import('@/features/travel/RoutesPage')).RoutesPage,
        }),
      },
      {
        path: 'viagens/:id',
        lazy: async () => ({
          Component: (await import('@/features/travel/RouteDetailPage')).RouteDetailPage,
        }),
      },
      {
        path: 'permissoes',
        lazy: async () => ({
          Component: (await import('@/features/permissions/PermissionsPage')).PermissionsPage,
        }),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);

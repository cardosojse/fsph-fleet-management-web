import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/features/home/HomePage';
import { Loading } from '@/shared/components/ApiFeedback';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/login',
    hydrateFallbackElement: <Loading />,
    lazy: async () => ({ Component: (await import('@/features/auth/LoginPage')).LoginPage }),
  },
  {
    path: '/relatorios',
    hydrateFallbackElement: <Loading />,
    lazy: async () => ({
      Component: (await import('@/features/reports/ReportsRoute')).ReportsRoute,
    }),
  },
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);

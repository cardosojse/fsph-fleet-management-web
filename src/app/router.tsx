import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { FuelCardsLayout } from '@/features/fuel-cards/components/FuelCardsLayout';
import { FuelCardEditPage } from '@/features/fuel-cards/FuelCardEditPage';

import { HomePage } from '@/features/home/HomePage';
import { FuelCardsPage } from '@/features/fuel-cards/FuelCardsPage';
import { FuelCardCreatePage } from '@/features/fuel-cards/FuelCardCreatePage';
import { FuelCardDetailsPage } from '@/features/fuel-cards/FuelCardDetailsPage';
import { FuelCardsProvider } from '@/features/fuel-cards/data/FuelCardsProvider';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

export const routes: RouteObject[] = [
  { path: '/cartoes-combustivel/inicio', element: <Navigate to="/cartoes-combustivel" replace /> },
  {
    path: '/cartoes-combustivel',
    element: (
      <FuelCardsProvider>
        <FuelCardsLayout />
      </FuelCardsProvider>
    ),
    children: [
      { index: true, element: <FuelCardsPage /> },
      { path: 'novo', element: <FuelCardCreatePage /> },
      { path: ':id/editar', element: <FuelCardEditPage /> },
      { path: ':id', element: <FuelCardDetailsPage /> },
    ],
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

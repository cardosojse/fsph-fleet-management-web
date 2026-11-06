import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { DriversPage } from '@/features/drivers/DriversPage';
import { DriverRegistrationPage } from '@/features/drivers/DriverRegistrationPage';
import { VehiclesPage } from '@/features/vehicles/VehiclesPage';
import { VehicleRegistrationPage } from '@/features/vehicles/VehicleRegistrationPage';
import { FleetLayout } from '@/shared/components/FleetLayout';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <FleetLayout />,
    children: [
      { index: true, element: <Navigate to="/motoristas" replace /> },
      { path: 'motoristas', element: <DriversPage /> },
      { path: 'motoristas/novo', element: <DriverRegistrationPage /> },
      { path: 'veiculos', element: <VehiclesPage /> },
      { path: 'veiculos/novo', element: <VehicleRegistrationPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);

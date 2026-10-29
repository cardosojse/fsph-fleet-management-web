import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

describe('App', () => {
  it('renderiza a página de motoristas e veículos', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(
      await screen.findByRole('heading', {
        name: /motoristas e veículos/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/gerencie os cadastros e acompanhe as informações da frota/i),
    ).toBeInTheDocument();
  });
});

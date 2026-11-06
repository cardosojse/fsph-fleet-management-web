import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

describe('App', () => {
  it('redireciona para a página de motoristas', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(
      await screen.findByRole('heading', {
        name: /^motoristas$/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/gerencie os cadastros e acompanhe as informações da frota/i),
    ).toBeInTheDocument();
  });
});

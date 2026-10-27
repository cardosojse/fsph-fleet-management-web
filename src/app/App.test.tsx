import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

describe('App', () => {
  it('renderiza a página inicial da infraestrutura', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(await screen.findByRole('heading', { name: /gestão de frotas/i })).toBeInTheDocument();
    expect(screen.getByText(/infraestrutura do frontend pronta/i)).toBeInTheDocument();
  });
});

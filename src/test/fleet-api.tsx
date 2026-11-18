import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { setupServer } from 'msw/node';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';

import { authToken } from '@/shared/api/auth-token';

export function mockFleetApi(...handlers: RequestHandler[]) {
  const server = setupServer(
    http.get('*/api/v1/auth/me', ({ request }) =>
      request.headers.get('Authorization') === 'Bearer token-de-teste'
        ? HttpResponse.json({
            name: 'Conta de teste',
            role: 'ADMIN',
            permissions: ['TRIP_REQUESTS_MANAGE'],
          })
        : HttpResponse.json({}, { status: 401 }),
    ),
    ...handlers,
  );
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
}

export function renderFleetPage(element: ReactNode, path: string, authenticated = true) {
  if (authenticated) authToken.set('token-de-teste');
  const router = createMemoryRouter([{ path, element }], { initialEntries: [path] });
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={cache}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

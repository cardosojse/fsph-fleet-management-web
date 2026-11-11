import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { queryClient } from '@/app/providers/queryClient';
import { authToken } from '@/shared/api/auth-token';

const base = `${window.location.origin}/api/v1`;
const me = {
  id: 'admin-id',
  sectorId: 'sector-id',
  name: 'Maria',
  email: 'maria@fsph.test',
  role: 'ADMIN',
};
const server = setupServer(http.get(`${base}/auth/me`, () => HttpResponse.json(me)));
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

function renderPage(path: string, authenticated = true) {
  if (authenticated) authToken.set('test-token');
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe('App', () => {
  it('carrega o usuário autenticado e os módulos', async () => {
    renderPage('/');
    expect(await screen.findByRole('heading', { name: /gestão de frotas/i })).toBeInTheDocument();
    expect(screen.getByText(/Olá, Maria/)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
  });

  it('protege a rota e volta ao endereço solicitado após o login', async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    server.use(
      http.post(`${base}/auth/login`, async ({ request }) => {
        login(await request.json());
        return HttpResponse.json({
          accessToken: 'new-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
        });
      }),
      http.get(`${base}/sectors`, ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer new-token');
        return HttpResponse.json([]);
      }),
    );
    const router = renderPage('/setores', false);
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), 'maria@fsph.test');
    await user.type(screen.getByLabelText('Senha'), 'senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Setores' })).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ email: 'maria@fsph.test', password: 'senha-segura' });
    expect(router.state.location.pathname).toBe('/setores');
    expect(authToken.get()).toBe('new-token');
  });

  it('encerra a sessão ao receber 401 em uma consulta protegida', async () => {
    server.use(
      http.get(`${base}/sectors`, () =>
        HttpResponse.json({ detail: 'Token expirado' }, { status: 401 }),
      ),
    );
    renderPage('/setores');
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(authToken.get()).toBeNull();
  });

  it('informa 403 sem repetir a requisição', async () => {
    const read = vi.fn(() =>
      HttpResponse.json({ detail: 'Acesso negado', code: 'ACCESS_DENIED' }, { status: 403 }),
    );
    server.use(http.get(`${base}/sectors`, read));
    renderPage('/setores');
    expect(await screen.findByText('Acesso negado')).toBeInTheDocument();
    expect(read).toHaveBeenCalledTimes(1);
    expect(authToken.get()).toBe('test-token');
  });

  it('mostra validações do backend e atualiza a lista após salvar o setor', async () => {
    const user = userEvent.setup();
    const sectors = [{ id: 'one', name: 'Administrativo' }];
    let attempts = 0;
    server.use(
      http.get(`${base}/sectors`, () => HttpResponse.json(sectors)),
      http.post(`${base}/sectors`, async ({ request }) => {
        const body = (await request.json()) as { name: string };
        attempts += 1;
        if (attempts === 1)
          return HttpResponse.json(
            {
              detail: 'Dados inválidos',
              code: 'VALIDATION_ERROR',
              violations: [{ field: 'name', message: 'Nome já cadastrado' }],
            },
            { status: 400 },
          );
        sectors.push({ id: 'two', name: body.name });
        return HttpResponse.json(sectors[1], { status: 201 });
      }),
    );
    renderPage('/setores');
    await screen.findByText('Administrativo');
    await user.click(screen.getByRole('button', { name: 'Novo setor' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nome do setor'), 'Coleta');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));
    expect(await within(dialog).findByText('Nome já cadastrado')).toBeInTheDocument();
    await user.clear(within(dialog).getByLabelText('Nome do setor'));
    await user.type(within(dialog).getByLabelText('Nome do setor'), 'Laboratório');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Laboratório')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('revoga o token no backend ao sair e limpa os dados locais', async () => {
    const user = userEvent.setup();
    const logout = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(http.post(`${base}/auth/logout`, logout));
    renderPage('/');
    await user.click(await screen.findByRole('button', { name: 'Sair' }));
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(logout).toHaveBeenCalledOnce();
    expect(authToken.get()).toBeNull();
    expect(queryClient.getQueryData(['session', 'test-token'])).toBeUndefined();
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from '@/app/router';
import { AppProviders } from '@/app/providers/AppProviders';

async function renderPage() {
  const router = createMemoryRouter(routes, { initialEntries: ['/usuarios'] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await screen.findByRole('heading', { name: 'Credenciamento do colaborador' });
  return router;
}

describe('UsuariosPage', () => {
  it('gera senha, prepara o cadastro local e permite cancelar', async () => {
    await renderPage();
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Paula Mendes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gerar senha' }));
    const password = screen.getByLabelText('Senha temporária');
    expect((password as HTMLInputElement).value).toHaveLength(16);
    fireEvent.click(screen.getByLabelText('Mostrar senha'));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Cadastro de Paula Mendes preparado nesta sessão',
    );
    expect(password).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cadastro cancelado');
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
  });

  it('exibe os campos de CNH somente para motorista', async () => {
    await renderPage();
    expect(screen.getByLabelText('CNH')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Perfil de acesso' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Atendente' }));
    expect(screen.queryByLabelText('CNH')).not.toBeInTheDocument();
    expect(screen.queryByText('Exemplo e validações')).not.toBeInTheDocument();
  });

  it('conecta usuários, dashboard, solicitações e atendimento pela sidebar', async () => {
    const router = await renderPage();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getByRole('link', { name: 'Usuários' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.click(within(nav).getByRole('link', { name: 'Dashboard' }));
    await screen.findByRole('heading', { name: 'Visão geral da frota' });
    fireEvent.click(screen.getByRole('link', { name: 'Solicitações' }));
    await screen.findByRole('heading', { name: 'Solicitações' });
    fireEvent.click(screen.getByRole('link', { name: 'Nova solicitação' }));
    await screen.findByRole('heading', { name: 'Dados da solicitação' });
    fireEvent.click(screen.getByRole('link', { name: 'Atendimento SVO' }));
    await screen.findByRole('heading', { name: 'Atendimento SVO' });
    fireEvent.click(screen.getByRole('link', { name: 'Usuários' }));
    await screen.findByRole('heading', { name: 'Credenciamento do colaborador' });
    expect(router.state.location.pathname).toBe('/usuarios');
  });
});

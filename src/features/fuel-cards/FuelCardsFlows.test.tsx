import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { fuelCardSchema } from '@/features/fuel-cards/demo/demo-validation';

beforeEach(() => vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'true'));
afterEach(() => vi.unstubAllEnvs());

async function setup(path = '/cartoes-combustivel') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  return userEvent.setup();
}

async function fillCard(user: ReturnType<typeof userEvent.setup>, number: string) {
  await user.type(screen.getByLabelText(/^Número do cartão/), number);
  await user.type(screen.getByLabelText(/^Limite total/), '1500,50');
  // O input month não tem suporte completo à digitação no jsdom.
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.change(screen.getByLabelText(/^Validade/), { target: { value: '2099-12' } });
}

describe('Fluxos demonstrativos da HU30', () => {
  it('cadastra, consulta, vincula, confirma status e preserva as mudanças ao navegar', async () => {
    const user = await setup();
    await user.click(screen.getByRole('link', { name: 'Novo cartão' }));
    await fillCard(user, '4444 5555 6666 7788');
    expect(screen.getByLabelText(/^Número do cartão/)).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Salvar cartão demonstrativo' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cartão cadastrado apenas nesta demonstração',
    );
    const table = within(await screen.findByRole('table'));
    await user.click(table.getByRole('link', { name: 'Ver detalhes do cartão •••• 7788' }));
    expect(screen.getByRole('heading', { name: 'Detalhes do cartão' })).toBeInTheDocument();
    expect(screen.getAllByText('Não informado', { selector: 'dd' })).toHaveLength(3);
    expect(screen.queryByText('4444555566667788')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Veículo demonstrativo' }));
    await user.click(screen.getByRole('option', { name: /GHI7J89/ }));
    await user.click(screen.getByRole('button', { name: 'Vincular veículo' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Veículo vinculado apenas nesta demonstração',
    );
    expect(screen.getByText('GHI7J89 · Veículo demonstrativo 3')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Novo status demonstrativo' }));
    await user.click(screen.getByRole('option', { name: 'Ativo' }));
    await user.click(screen.getByRole('button', { name: 'Revisar alteração de status' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText(/passará de Não informado para Ativo/)).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Cancelar alteração' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getAllByText('Não informado', { selector: 'dd' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Revisar alteração de status' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Confirmar alteração',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent(
      'Status alterado apenas nesta demonstração',
    );
    expect(screen.getByText('Ativo', { selector: 'dd' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Voltar à listagem' }));
    const row = within(screen.getByRole('table'))
      .getByRole('link', { name: 'Ver detalhes do cartão •••• 7788' })
      .closest('tr')!;
    expect(within(row).getByText('Ativo')).toBeInTheDocument();
    expect(within(row).getByText(/GHI7J89/)).toBeInTheDocument();
    expect(within(row).getByText('Não informado')).toBeInTheDocument();
    expect(within(row).getByText(/1.500,50/)).toBeInTheDocument();
    // Duplicidade continua bloqueada depois de navegar.
    await user.click(screen.getByRole('link', { name: 'Novo cartão' }));
    await fillCard(user, '4444-5555-6666-7788');
    await user.click(screen.getByRole('button', { name: 'Salvar cartão demonstrativo' }));
    expect(screen.getByText(/Já existe um cartão com esse número/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Número do cartão/)).toHaveFocus();
  });

  it('valida campos obrigatórios e cancela sem cadastrar', async () => {
    const user = await setup('/cartoes-combustivel/novo');
    await user.click(screen.getByRole('button', { name: 'Salvar cartão demonstrativo' }));
    expect(screen.getByText('Informe o número do cartão.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Limite total/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/^Validade/)).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('link', { name: 'Cancelar cadastro' }));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7);
  });

  it('trata cartão inexistente sem exibir ações de alteração', async () => {
    await setup('/cartoes-combustivel/inexistente');
    expect(screen.getByText(/Cartão não encontrado nesta demonstração/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar à listagem' })).toBeInTheDocument();
  });

  it.each([
    { number: 'abc', limit: '100', validity: '2099-12' },
    { number: '12345678', limit: '-1', validity: '2099-12' },
    { number: '12345678', limit: '0', validity: '2099-12' },
    { number: '12345678', limit: '1,234', validity: '2099-12' },
    { number: '12345678', limit: '100', validity: '2000-01' },
    { number: '12345678', limit: '100', validity: '2099-13' },
  ])('rejeita valores demonstrativos inválidos: %j', (values) => {
    expect(fuelCardSchema.safeParse(values).success).toBe(false);
  });

  it('não persiste os cartões ao remontar a área', async () => {
    const user = await setup('/cartoes-combustivel/novo');
    await fillCard(user, '87654321');
    await user.click(screen.getByRole('button', { name: 'Salvar cartão demonstrativo' }));
    await screen.findByRole('heading', { name: 'Cartões de combustível' });
    // Uma nova entrada na área remonta o provider, como documentado.
    const { cleanup } = await import('@testing-library/react');
    cleanup();
    await setup();
    expect(
      screen.queryByRole('link', { name: 'Ver detalhes do cartão •••• 4321' }),
    ).not.toBeInTheDocument();
  });
});

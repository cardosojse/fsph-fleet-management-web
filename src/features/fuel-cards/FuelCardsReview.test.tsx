import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

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
async function confirm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar alteração' }),
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}
describe('Revisão HU30', () => {
  it('abre a listagem diretamente e redireciona o endereço antigo', async () => {
    await setup('/cartoes-combustivel/inicio');
    expect(
      await screen.findByRole('heading', { name: 'Cartões de combustível' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Voltar ao início' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
  it('edita sem revelar o número e mantém a alteração ao voltar à listagem', async () => {
    const user = await setup('/cartoes-combustivel/demo-1');
    await user.click(screen.getByRole('link', { name: 'Editar cartão' }));
    expect(screen.getByLabelText('Novo número do cartão')).toHaveValue('');
    const limit = screen.getByLabelText(/^Limite total/);
    await user.clear(limit);
    await user.type(limit, '7250,50');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('heading', { name: 'Detalhes do cartão' });
    expect(screen.getByText(/7.250,50/, { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText(/3.250,50/, { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('Ativo', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('1111222233331042')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Voltar à listagem' }));
    expect(within(screen.getByRole('table')).getByText(/7.250,50/)).toBeInTheDocument();
  });
  it('rejeita duplicidade na edição e cancela sem alterar dados', async () => {
    const user = await setup('/cartoes-combustivel/demo-1/editar');
    await user.type(screen.getByLabelText('Novo número do cartão'), '1111 2222 3333 2086');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText(/Já existe um cartão com esse número/)).toBeInTheDocument();
    expect(screen.getByLabelText('Novo número do cartão')).toHaveFocus();
    await user.click(screen.getByRole('link', { name: 'Cancelar edição' }));
    expect(within(screen.getByRole('table')).getByText('•••• 1042')).toBeInTheDocument();
  });
  it('edita o número para outro fictício e exibe somente o final', async () => {
    const user = await setup('/cartoes-combustivel/demo-1/editar');
    await user.type(screen.getByLabelText('Novo número do cartão'), '1234567890129999');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('heading', { name: 'Detalhes do cartão' });
    expect(screen.getByText('•••• 9999', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.queryByText('1234567890129999')).not.toBeInTheDocument();
  });
  it('desvincula e cancela cartão apenas depois de confirmar', async () => {
    const user = await setup('/cartoes-combustivel/demo-1');
    await user.click(screen.getByRole('button', { name: 'Desvincular veículo' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar alteração' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText(/ABC1D23/, { selector: 'dd' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desvincular veículo' }));
    await confirm(user);
    expect(screen.queryByText(/ABC1D23/, { selector: 'dd' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desvincular veículo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancelar cartão' }));
    expect(screen.getByText('Ativo', { selector: 'dd' })).toBeInTheDocument();
    await confirm(user);
    expect(screen.getByText('Cancelado', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar cartão' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Status alterado apenas nesta demonstração',
    );
  });
  it('pesquisa por final e placa, combina filtros e limpa resultados vazios', async () => {
    const user = await setup();
    const search = screen.getByRole('textbox', { name: 'Pesquisar por final do cartão ou placa' });
    await user.type(search, '1042');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
    await user.clear(search);
    await user.type(search, 'def4g56');
    expect(within(screen.getByRole('table')).getByText('•••• 2086')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Ativo' }));
    expect(
      screen.getByRole('heading', { name: 'Nenhum resultado para esta pesquisa' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    await user.click(screen.getByRole('combobox', { name: 'Setor' }));
    await user.click(screen.getByRole('option', { name: 'Administrativo' }));
    expect(within(screen.getByRole('table')).getByText('•••• 1042')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText('•••• 2086')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7);
  });
  it('exibe recuperação para edição de cartão inexistente', async () => {
    await setup('/cartoes-combustivel/inexistente/editar');
    expect(screen.getByRole('alert')).toHaveTextContent('Cartão não encontrado');
    expect(screen.getByRole('link', { name: 'Voltar à listagem' })).toBeInTheDocument();
  });
  it.each([
    '/cartoes-combustivel/novo',
    '/cartoes-combustivel/demo-1/editar',
    '/cartoes-combustivel/demo-1',
  ])('Voltar sempre retorna à listagem: %s', async (path) => {
    const user = await setup(path);
    await user.click(screen.getByRole('link', { name: 'Voltar à listagem' }));
    expect(screen.getByRole('heading', { name: 'Cartões de combustível' })).toBeInTheDocument();
  });
});

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProviders } from '@/app/providers/AppProviders';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/app/router';

function setup(path = '/veiculos') {
  const user = userEvent.setup();
  render(
    <AppProviders>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppProviders>,
  );
  return user;
}

// Multiple MUI transitions and user interactions need headroom on Windows runners.
describe('Motoristas e Veículos', { timeout: 15_000 }, () => {
  it('combina busca, setor e status e limpa todos os filtros', async () => {
    const user = setup();
    await user.click(screen.getByRole('link', { name: 'Motoristas' }));
    await user.click(screen.getByRole('combobox', { name: 'Setor' }));
    await user.click(screen.getByRole('option', { name: 'Operações' }));
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Disponível' }));
    await user.type(screen.getByRole('textbox', { name: 'Pesquisar' }), 'Carlos');
    expect(screen.getByText('Carlos Lima')).toBeVisible();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Pesquisar' }), 'inexistente');
    expect(screen.getByText('Nenhum resultado para os filtros selecionados.')).toBeVisible();
    expect(
      screen.getByText('Nenhum resultado para os filtros selecionados.').closest('td'),
    ).toHaveAttribute('colspan', '5');
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByRole('textbox', { name: 'Pesquisar' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Setor' })).toHaveTextContent('Todos');
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Todos');
    expect(screen.getByText('Maria Santos')).toBeVisible();
  });

  it('mostra os detalhes do veículo selecionado e permite fechar', async () => {
    const user = setup();
    for (const [plate, model] of [
      ['ABC-1D23', 'Fiat Argo'],
      ['DEF-4G56', 'Chevrolet Onix'],
    ]) {
      await user.click(screen.getByRole('button', { name: `Detalhes do veículo ${plate}` }));
      const dialog = screen.getByRole('dialog', { name: 'Detalhes do veículo' });
      expect(within(dialog).getByText(`Placa: ${plate}`)).toBeVisible();
      expect(within(dialog).getByText(`Modelo: ${model}`)).toBeVisible();
      await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
  });

  it('simula carregamento, erro e lista vazia sem apagar cadastros', async () => {
    const user = setup();
    async function select(name: string) {
      await user.click(screen.getByRole('combobox', { name: 'Estado demonstrativo' }));
      await user.click(screen.getByRole('option', { name }));
    }
    await select('Carregamento');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados demonstrativos');
    await select('Erro');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nova tentativa demonstrativa concluída.')).toBeVisible();
    await select('Lista vazia');
    expect(screen.getByText('Nenhum cadastro nesta lista demonstrativa.')).toBeVisible();
    expect(screen.getByText('ABC-1D23')).toBeVisible();
    await select('Desativado');
    expect(
      screen.queryByText('Nenhum cadastro nesta lista demonstrativa.'),
    ).not.toBeInTheDocument();
  });
});

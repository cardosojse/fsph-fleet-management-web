import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

function setup(path = '/motoristas/novo') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { user: userEvent.setup(), router };
}

function fillFields() {
  Object.entries({
    'Nome completo': 'Ana Teste',
    CPF: '111.444.777-35',
    Telefone: '(11) 99999-1234',
    'E-mail': 'ana@example.test',
    Setor: 'Operações',
    'Número da CNH': '99887766554',
    'Validade da CNH': '2099-12-31',
  }).forEach(([name, value]) =>
    fireEvent.change(screen.getByLabelText(name, { exact: true }), { target: { value } }),
  );
}

describe('Página de cadastro de motorista', { timeout: 15_000 }, () => {
  it('abre pela listagem e cancela sem criar registros', async () => {
    const { user, router } = setup('/motoristas');
    await user.click(screen.getByRole('button', { name: 'Cadastrar novo motorista' }));
    expect(router.state.location.pathname).toBe('/motoristas/novo');
    expect(screen.getByRole('heading', { name: 'Novo motorista' })).toHaveFocus();
    for (const name of ['Dados pessoais', 'CNH e conta', 'Equipe e plantão'])
      expect(screen.getByRole('heading', { name })).toBeVisible();
    await user.type(screen.getByLabelText('Nome completo', { exact: true }), 'Não salvar');
    await user.click(screen.getByRole('link', { name: 'Cancelar' }));
    expect(router.state.location.pathname).toBe('/motoristas');
    expect(screen.queryByText('Não salvar')).not.toBeInTheDocument();
  });

  it('exibe erros nos campos e no painel e foca o primeiro campo inválido', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Cadastrar motorista' }));
    expect(await screen.findByRole('textbox', { name: 'Nome completo' })).toHaveFocus();
    const panel = screen.getByRole('complementary', { name: 'Validações do cadastro' });
    expect(within(panel).getByText('Revise os dados informados')).toBeVisible();
    fillFields();
    fireEvent.change(screen.getByLabelText('CPF', { exact: true }), { target: { value: '123' } });
    await user.click(screen.getByRole('button', { name: 'Cadastrar motorista' }));
    expect(screen.getByLabelText('CPF', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    expect(within(panel).getByRole('link', { name: /CPF: Informe um CPF válido/ })).toBeVisible();
  });

  it('salva o cadastro, retorna à listagem e preserva os novos dados nos detalhes', async () => {
    const { user, router } = setup();
    fillFields();
    await user.click(screen.getByRole('combobox', { name: /Categoria da CNH/ }));
    await user.click(screen.getByRole('option', { name: 'B' }));
    await user.click(screen.getByRole('button', { name: 'Cadastrar motorista' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/motoristas'));
    expect(await screen.findByRole('status')).toHaveTextContent('Ana Teste cadastrado com sucesso');
    await user.click(screen.getByRole('link', { name: 'Veículos' }));
    await user.click(screen.getByRole('link', { name: 'Motoristas' }));
    await user.click(screen.getByRole('button', { name: 'Detalhes do motorista Ana Teste' }));
    expect(within(screen.getByRole('dialog')).getByText('CPF: 11144477735')).toBeVisible();
    expect(within(screen.getByRole('dialog')).getByText('E-mail: ana@example.test')).toBeVisible();
  });
});

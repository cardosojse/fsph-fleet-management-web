import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

function setup(path = '/veiculos/novo') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { user: userEvent.setup(), router };
}
function setField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
}
function fillRequired() {
  for (const [label, value] of Object.entries({
    Placa: 'xyz-9a12',
    'Modelo / Marca': 'Renault Teste',
    Ano: '2023',
    Setor: 'Administrativo',
    'CRLV vigente até': '2099-12-31',
    'Seguro vigente até': '2099-12-31',
    'Capacidade máxima': '4',
  }))
    setField(label, value);
}

describe('Página de cadastro de veículos', { timeout: 15_000 }, () => {
  it('navega da listagem para a página e cancela sem salvar', async () => {
    const { user, router } = setup('/veiculos');
    await user.click(screen.getByRole('button', { name: /Cadastrar veículo/ }));
    expect(router.state.location.pathname).toBe('/veiculos/novo');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Novo veículo' })).toHaveFocus();
    for (const name of ['Identificação', 'Documentos', 'Operação', 'Carta'])
      expect(screen.getByRole('heading', { name })).toBeVisible();
    setField('Placa', 'XYZ9A12');
    await user.click(screen.getByRole('link', { name: 'Cancelar' }));
    expect(await screen.findByRole('heading', { name: 'Veículos', level: 1 })).toBeVisible();
    expect(screen.queryByText('XYZ9A12')).not.toBeInTheDocument();
  });

  it('foca o primeiro erro e apresenta duplicidade e campos inválidos no painel real', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Cadastrar veículo' }));
    expect(screen.getByLabelText('Placa', { exact: true })).toHaveFocus();
    const panel = screen.getByRole('region', { name: 'Validações obrigatórias' });
    expect(within(panel).getByText('Revise os dados informados')).toBeVisible();
    setField('Placa', ' abc1d23 ');
    setField('Capacidade máxima', '0');
    setField('CRLV vigente até', '2020-01-01');
    await user.click(screen.getByRole('button', { name: 'Cadastrar veículo' }));
    expect(within(panel).getByRole('link', { name: /Placa: Já existe um veículo/ })).toBeVisible();
    expect(
      within(panel).getByRole('link', { name: /Capacidade máxima: A capacidade máxima/ }),
    ).toBeVisible();
    await user.click(within(panel).getByRole('link', { name: /CRLV vigente até:/ }));
    expect(screen.getByLabelText('CRLV vigente até', { exact: true })).toHaveFocus();
  });

  it('calcula saldo somente leitura e salva os dados, sem bloquear pelos exemplos', async () => {
    const { user, router } = setup();
    fillRequired();
    await user.click(screen.getByRole('combobox', { name: /Categoria/ }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'SVO',
      'Passeio',
      'Van',
    ]);
    await user.click(screen.getByRole('option', { name: 'SVO' }));
    await user.click(screen.getByRole('combobox', { name: /^Combustível\s*\*?$/ }));
    await user.click(screen.getByRole('option', { name: 'Diesel' }));
    setField('Limite da carta', '1.500,00');
    setField('Valor usado', '0,10');
    setField('Validade da carta', '2099-12-31');
    setField('Documentos anexos', 'Referência CRLV demonstrativa');
    expect(screen.getByLabelText('Saldo disponível', { exact: true })).toHaveValue(
      'R$\u00a01.499,90',
    );
    expect(screen.getByLabelText('Saldo disponível', { exact: true })).toHaveAttribute('readonly');
    const examples = screen.getByRole('region', { name: 'Erros demonstrativos' });
    expect(within(examples).queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cadastrar veículo' }));
    expect(await screen.findByRole('status')).toHaveTextContent('XYZ9A12 cadastrado com sucesso');
    expect(router.state.location.pathname).toBe('/veiculos');
    expect(screen.getByRole('cell', { name: 'SVO' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Motoristas' }));
    await user.click(screen.getByRole('link', { name: 'Veículos' }));
    await user.click(screen.getByRole('button', { name: 'Detalhes do veículo XYZ9A12' }));
    const details = screen.getByRole('dialog');
    expect(within(details).getByText('Categoria: SVO')).toBeVisible();
    expect(within(details).getByText('Modelo: Renault Teste')).toBeVisible();
    expect(within(details).getByText(/Saldo disponível:/)).toHaveTextContent('1.499,90');
    expect(within(details).getByText(/Documentos anexos/)).toHaveTextContent(
      'Referência CRLV demonstrativa',
    );
  });
});

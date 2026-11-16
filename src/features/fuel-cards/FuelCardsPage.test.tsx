import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';
import type { ComponentProps } from 'react';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { FuelCardsPage } from '@/features/fuel-cards/FuelCardsPage';

function renderState(state: ComponentProps<typeof FuelCardsPage>['state']) {
  return render(
    <AppProviders>
      <MemoryRouter>
        <FuelCardsPage state={state} />
      </MemoryRouter>
    </AppProviders>,
  );
}

beforeEach(() => vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'true'));
afterEach(() => vi.unstubAllEnvs());

describe('Listagem de cartões', () => {
  it('abre pela rota, sem seletor ou carregamento artificial, e apresenta os campos', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/cartoes-combustivel'] });
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    await screen.findByRole('table');
    expect(screen.getByRole('heading', { name: 'Cartões de combustível' })).toBeInTheDocument();
    expect(screen.getByText(/dados fictícios, sem integração com a API/)).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Cenário demonstrativo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    const table = within(screen.getByRole('table'));
    for (const label of [
      'Cartão',
      'Veículo vinculado',
      'Setor',
      'Limite total',
      'Saldo disponível',
      'Validade',
      'Status',
    ]) {
      expect(table.getByRole('columnheader', { name: label })).toBeInTheDocument();
    }
    expect(table.getByText(/R\$\s*0,00/)).toBeInTheDocument();
    const incompleteCard = table.getByText('•••• 3091').closest('tr')!;
    expect(within(incompleteCard).getAllByText('Não informado')).toHaveLength(6);
  });

  it('apresenta os rótulos e os dados também nos cartões para dispositivos menores', () => {
    renderState({
      status: 'ready',
      cards: [{ id: 'one', card: '•••• 1042', vehicle: 'Veículo de exemplo', availableBalance: 0 }],
    });
    const article = within(screen.getByRole('article'));
    expect(article.getByRole('heading', { name: 'Cartão •••• 1042' })).toBeInTheDocument();
    expect(article.getByText('Veículo vinculado')).toBeInTheDocument();
    expect(article.getByText('Veículo de exemplo')).toBeInTheDocument();
    expect(article.getByText(/R\$\s*0,00/)).toBeInTheDocument();
    expect(article.getAllByText('Não informado')).toHaveLength(4);
  });

  it('apresenta e encerra o carregamento quando recebe os dados', () => {
    const view = renderState({ status: 'loading' });
    expect(screen.getByRole('progressbar', { name: 'Carregando cartões' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Consulta de cartões' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    view.rerender(
      <AppProviders>
        <MemoryRouter>
          <FuelCardsPage state={{ status: 'ready', cards: [] }} />
        </MemoryRouter>
      </AppProviders>,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Consulta de cartões' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.getByRole('heading', { name: 'Nenhum cartão encontrado' })).toBeInTheDocument();
  });

  it('mostra uma mensagem de erro sem oferecer uma operação inexistente', () => {
    renderState({ status: 'error' });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os cartões');
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('permite tentar novamente pelo teclado somente quando recebe uma operação', async () => {
    const onRetry = vi.fn();
    renderState({ status: 'error', onRetry });
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

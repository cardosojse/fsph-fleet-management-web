import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import '@/test/demo-session';

function renderPage(path = '/relatorios') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe('Relatórios', () => {
  it('abre a rota e deixa explícita a indisponibilidade de dados e ações', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Relatórios', level: 1 });
    expect(screen.getByRole('heading', { name: 'Relatórios', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum dado real foi consultado');
    for (const name of ['Gerar PDF', 'Gerar Excel', 'Imprimir']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
    expect(screen.queryByLabelText('Relatório individual')).not.toBeInTheDocument();
  });

  it('permite selecionar indicadores observados e atualiza a prévia', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(await screen.findByLabelText('Tipo'), 'individual');
    const select = screen.getByLabelText('Relatório individual');
    expect(within(select).getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('Relatório individual', { selector: 'label' })).toHaveAttribute(
      'data-shrink',
      'true',
    );
    await user.selectOptions(select, 'fuelings');
    expect(screen.getByText('Relatório: Abastecimentos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gerar PDF' })).toBeDisabled();
  });

  it('limpa o indicador ao trocar módulo e lista os relatórios SVO implementados', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(await screen.findByLabelText('Tipo'), 'individual');
    await user.selectOptions(screen.getByLabelText('Relatório individual'), 'fuelings');
    await user.selectOptions(screen.getByLabelText('Módulo'), 'svo');
    const select = screen.getByLabelText('Relatório individual');
    expect(select).toBeEnabled();
    expect(select).toHaveValue('');
    expect(screen.getByText('Relatório individual', { selector: 'label' })).toHaveAttribute(
      'data-shrink',
      'true',
    );
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual([
      'Selecione um relatório',
      'Disponibilidade da frota',
      'Frota por status',
      'Triagem e alocação',
      'Solicitações por dia',
      'Viagens em andamento',
      'Consumo por veículo',
      'Abastecimentos recentes',
      'Alertas de manutenção',
    ]);
    await user.selectOptions(select, 'availability');
    expect(screen.queryByLabelText('Data inicial')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consultar situação atual' })).toBeEnabled();
    await user.selectOptions(screen.getByLabelText('Módulo'), 'fleet');
    expect(screen.getByLabelText('Relatório individual')).toHaveValue('');
  });

  it('não exibe erros de datas antes da interação com cada campo', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Relatórios', level: 1 });
    const start = screen.getByLabelText('Data inicial');
    const end = screen.getByLabelText('Data final');
    expect(start).toHaveAttribute('aria-invalid', 'false');
    expect(end).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Informe uma data inicial válida.')).not.toBeInTheDocument();
    expect(screen.queryByText('Informe uma data final válida.')).not.toBeInTheDocument();
    fireEvent.focus(start);
    expect(start).toHaveAttribute('aria-invalid', 'false');
    fireEvent.blur(start);
    expect(start).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Informe uma data inicial válida.')).toBeInTheDocument();
    expect(end).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(start, { target: { value: '2026-11-14' } });
    expect(start).toHaveAttribute('aria-invalid', 'false');
    expect(end).toHaveAttribute('aria-invalid', 'false');
    fireEvent.blur(end);
    expect(screen.getByText('Informe uma data final válida.')).toBeInTheDocument();
  });

  it('valida as datas após edição e mostra um período válido na estrutura para papel', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Relatórios', level: 1 });
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-11-14' } });
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-11-01' } });
    expect(screen.getByText(/A data final deve ser igual/)).toBeInTheDocument();
    expect(screen.getByLabelText('Data final')).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-11-14' } });
    expect(screen.getByText('Período: 14/11/2026 a 14/11/2026')).toBeInTheDocument();
    expect(screen.getByLabelText('Data final')).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-11-15' } });
    expect(screen.getByLabelText('Data final')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Imprimir' })).toBeDisabled();
  });

  it('preserva a navegação para a página inicial', async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(
      within(await screen.findByRole('navigation', { name: 'Localização' })).getByRole('link', {
        name: 'Início',
      }),
    );
    expect(router.state.location.pathname).toBe('/');
    expect(
      await screen.findByRole('heading', { name: 'Gestão de Frotas', level: 1 }),
    ).toBeInTheDocument();
  });

  it('mantém o tratamento da rota inexistente', () => {
    renderPage('/pagina-inexistente');
    expect(screen.queryByRole('heading', { name: 'Relatórios' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});

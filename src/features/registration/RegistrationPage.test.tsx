import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RegistrationPage } from './RegistrationPage';
import { loadDemoSectors, simulateRegistration } from './mocks/registration';

vi.mock('./mocks/registration', () => ({
  loadDemoSectors: vi.fn(),
  simulateRegistration: vi.fn(),
}));

function renderPage() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        })
      }
    >
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(loadDemoSectors)
    .mockReset()
    .mockResolvedValue([{ id: 'test', name: 'Transportes' }]);
  vi.mocked(simulateRegistration).mockReset().mockResolvedValue(undefined);
});

it('valida campos e conclui apenas a simulação', async () => {
  const user = userEvent.setup();
  renderPage();
  const submit = await screen.findByRole('button', { name: 'Cadastrar (demonstração)' });
  await user.click(submit);
  expect(await screen.findByText('Informe seu nome completo.')).toBeInTheDocument();
  expect(simulateRegistration).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText(/^Nome/), 'Maria Silva');
  await user.type(screen.getByLabelText(/^E-mail/), 'maria@orgao.gov.br');
  await user.type(screen.getByLabelText(/^Senha/), 'senha12345');
  await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(screen.getByLabelText(/^Senha/)).toHaveAttribute('type', 'text');
  await user.click(screen.getByRole('combobox', { name: /Setor/ }));
  await user.click(await screen.findByRole('option', { name: 'Transportes' }));
  await user.click(screen.getByRole('combobox', { name: /Perfil/ }));
  await user.click(screen.getByRole('option', { name: 'Motorista' }));
  await user.click(submit);
  expect(
    await screen.findByText('Simulação concluída. Nenhuma conta real foi criada.'),
  ).toBeInTheDocument();
  expect(simulateRegistration).toHaveBeenCalledTimes(1);
});

it('permite tentar carregar setores novamente após falha', async () => {
  vi.mocked(loadDemoSectors).mockRejectedValueOnce(new Error('offline'));
  renderPage();
  await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByRole('combobox', { name: /Setor/ })).toBeEnabled();
});

it('identifica lista de setores vazia', async () => {
  vi.mocked(loadDemoSectors).mockResolvedValue([]);
  renderPage();
  expect(await screen.findByText(/Nenhum setor cadastrado/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cadastrar (demonstração)' })).toBeDisabled();
});

it('informa quando a busca não encontra setores', async () => {
  renderPage();
  const sector = await screen.findByRole('combobox', { name: /Setor/ });
  await waitFor(() => expect(sector).toBeEnabled());
  await userEvent.type(sector, 'inexistente');
  expect(await screen.findByText('Nenhum setor encontrado para a busca.')).toBeInTheDocument();
});

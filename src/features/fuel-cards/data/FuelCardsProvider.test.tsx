import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { FuelCardsProvider } from '@/features/fuel-cards/data/FuelCardsProvider';
import { FuelCardsLayout } from '@/features/fuel-cards/components/FuelCardsLayout';
import { FuelCardsPage } from '@/features/fuel-cards/FuelCardsPage';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { createDemoRepository } from '@/features/fuel-cards/demo/create-demo-repository';
import type {
  FuelCardsRepository,
  FuelCardsSnapshot,
} from '@/features/fuel-cards/data/fuel-cards-repository';

afterEach(() => vi.unstubAllEnvs());
function mount(repository?: FuelCardsRepository, path = '/cartoes-combustivel') {
  const selected = repository
    ? [
        {
          path: '/cartoes-combustivel',
          element: (
            <FuelCardsProvider repository={repository}>
              <FuelCardsLayout />
            </FuelCardsProvider>
          ),
          children: [{ index: true, element: <FuelCardsPage /> }],
        },
      ]
    : routes;
  render(
    <AppProviders>
      <RouterProvider router={createMemoryRouter(selected, { initialEntries: [path] })} />
    </AppProviders>,
  );
}
describe('Seleção da fonte de dados HU30', () => {
  it('não usa mocks como fallback quando o modo demonstrativo não foi habilitado', () => {
    vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'false');
    mount();
    expect(screen.getByRole('status')).toHaveTextContent('Integração indisponível');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Novo cartão' })).not.toBeInTheDocument();
  });
  it.each([
    '/cartoes-combustivel',
    '/cartoes-combustivel/novo',
    '/cartoes-combustivel/demo-1',
    '/cartoes-combustivel/demo-1/editar',
  ])('bloqueia mocks em produção mesmo com flag true: %s', (path) => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'true');
    mount(undefined, path);
    expect(screen.getByRole('status')).toHaveTextContent('Integração indisponível');
    expect(screen.queryByText('•••• 1042')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
  it('não carrega nem um repositório demonstrativo injetado em produção', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'true');
    const repository = createDemoRepository();
    const load = vi.spyOn(repository, 'load');
    mount(repository);
    expect(load).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Integração indisponível');
  });
  it('permite substituir o adaptador e repetir uma consulta que falhou, sem recorrer a mocks', async () => {
    vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'false');
    // Stub do contrato interno de dados: não representa respostas ou endpoints reais.
    const repository: FuelCardsRepository = {
      ...createDemoRepository(),
      mode: 'api',
      load: vi
        .fn()
        .mockRejectedValueOnce(new Error('Falha de consulta'))
        .mockResolvedValue({ cards: [], vehicles: [], statusOptions: [] }),
    };
    mount(repository);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByRole('heading', { name: 'Nenhum cartão encontrado' }),
    ).toBeInTheDocument();
    expect(repository.load).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('•••• 1042')).not.toBeInTheDocument();
  });
  it('encerra o indicador quando uma fonte assíncrona retorna', async () => {
    vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'false');
    let resolve!: (value: FuelCardsSnapshot) => void;
    const repository: FuelCardsRepository = {
      ...createDemoRepository(),
      mode: 'api',
      load: () =>
        new Promise((done) => {
          resolve = done;
        }),
    };
    mount(repository);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await act(async () => resolve({ cards: [], vehicles: [], statusOptions: [] }));
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Nenhum cartão encontrado' })).toBeInTheDocument();
  });
  it('o snapshot demonstrativo não expõe os números completos à interface', async () => {
    const snapshot = await createDemoRepository().load();
    expect(JSON.stringify(snapshot)).not.toContain('1111222233331042');
    expect(snapshot.cards[0]).not.toHaveProperty('demoNumber');
  });
});

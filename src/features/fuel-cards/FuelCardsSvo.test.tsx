import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';
import { demoSvoSector } from '@/features/fuel-cards/demo/demo-config';
import { createDemoRepository } from '@/features/fuel-cards/demo/create-demo-repository';

beforeEach(() => vi.stubEnv('VITE_FUEL_CARDS_DEMO', 'true'));
afterEach(() => vi.unstubAllEnvs());
async function setup(path = '/cartoes-combustivel') {
  render(
    <AppProviders>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </AppProviders>,
  );
  await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  return userEvent.setup();
}

describe('Frota SVO na HU30', () => {
  it('filtra somente os cartões SVO e mostra setor na tabela, no celular e nos detalhes', async () => {
    const user = await setup();
    await user.click(screen.getByRole('combobox', { name: 'Setor' }));
    // Demais setores continuam disponíveis, inclusive os veículos ainda sem cartão.
    for (const name of ['Administrativo', 'Transportes', 'Apoio operacional']) {
      expect(screen.getByRole('option', { name })).toBeInTheDocument();
    }
    await user.click(screen.getByRole('option', { name: demoSvoSector }));
    const table = within(screen.getByRole('table'));
    expect(table.getAllByRole('row')).toHaveLength(4);
    expect(table.getAllByText(demoSvoSector)).toHaveLength(3);
    expect(table.queryByText('•••• 1042')).not.toBeInTheDocument();
    for (const article of screen.getAllByRole('article')) {
      expect(within(article).getByText(demoSvoSector)).toBeInTheDocument();
    }
    await user.click(table.getByRole('link', { name: 'Ver detalhes do cartão •••• 4101' }));
    expect(screen.getByText(demoSvoSector, { selector: 'dd' })).toBeInTheDocument();
    expect(
      screen.getByText('SVO-DEMO-01 · Chevrolet S10 (sem placa real)', { selector: 'dd' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Editar cartão' }));
    const limit = screen.getByLabelText(/^Limite total/);
    await user.type(limit, '1500,00');
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(screen.getByLabelText(/^Validade/), { target: { value: '2099-12' } });
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText(demoSvoSector, { selector: 'dd' })).toBeInTheDocument();
  });

  it('permite vincular uma S10 e remover o vínculo sem perder SVO no filtro', async () => {
    const user = await setup('/cartoes-combustivel/demo-3');
    await user.click(screen.getByRole('combobox', { name: 'Veículo demonstrativo' }));
    for (const suffix of ['01', '02', '03']) {
      expect(
        screen.getByRole('option', { name: `SVO-DEMO-${suffix} · Chevrolet S10 (sem placa real)` }),
      ).toBeInTheDocument();
    }
    await user.click(
      screen.getByRole('option', { name: 'SVO-DEMO-03 · Chevrolet S10 (sem placa real)' }),
    );
    await user.click(screen.getByRole('button', { name: 'Vincular veículo' }));
    expect(await screen.findByText(demoSvoSector, { selector: 'dd' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Desvincular veículo' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar alteração' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText(demoSvoSector, { selector: 'dd' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Voltar à listagem' }));
    await user.click(screen.getByRole('combobox', { name: 'Setor' }));
    await user.click(screen.getByRole('option', { name: demoSvoSector }));
    expect(within(screen.getByRole('table')).queryByText('•••• 3091')).not.toBeInTheDocument();
  });

  it('isola três S10 sem placas reais e mantém saldo inicial não informado', async () => {
    const repository = createDemoRepository();
    const snapshot = await repository.load();
    const vehicles = snapshot.vehicles.filter((vehicle) => vehicle.sector === demoSvoSector);
    expect(vehicles).toHaveLength(3);
    const created = await repository.createCard({
      number: '1234567890098765',
      limit: '1500',
      validity: '2099-12',
    });
    for (const vehicle of vehicles) {
      expect(vehicle.label).toContain('Chevrolet S10 (sem placa real)');
      await repository.linkVehicle(created.id, vehicle.id);
      const card = (await repository.load()).cards.find((item) => item.id === created.id);
      expect(card?.sector).toBe(demoSvoSector);
      expect(card?.availableBalance).toBeUndefined();
    }
    // A opção de filtro é obtida também do catálogo de veículos, mesmo sem vínculos SVO.
    for (const card of (await repository.load()).cards.filter(
      (item) => item.sector === demoSvoSector,
    )) {
      await repository.unlinkVehicle(card.id);
    }
    expect(
      (await repository.load()).vehicles.filter((vehicle) => vehicle.sector === demoSvoSector),
    ).toHaveLength(3);
  });
});

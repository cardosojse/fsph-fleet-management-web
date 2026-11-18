import { fireEvent, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { mockFleetApi, renderFleetPage } from '@/test/fleet-api';

const server = mockFleetApi(
  http.get('*/api/v1/trip-requests', () =>
    HttpResponse.json([{ status: 'PENDING', createdAt: new Date().toISOString() }]),
  ),
  http.get('*/api/v1/vehicles', () =>
    HttpResponse.json([
      { id: 'carro', model: 'Van da API', active: true, available: true, sectorId: 'svo' },
    ]),
  ),
  http.get('*/api/v1/trips', () =>
    HttpResponse.json({
      totalPages: 1,
      content: [
        {
          id: 'viagem-001',
          vehicleId: 'carro',
          driverId: 'm1',
          status: 'OPEN',
          startedAt: new Date().toISOString(),
        },
      ],
    }),
  ),
  http.get('*/api/v1/drivers', () => HttpResponse.json([{ id: 'm1', name: 'Motorista da API' }])),
  http.get('*/api/v1/sectors', () =>
    HttpResponse.json([
      { id: 'svo', name: 'SVO' },
      { id: 'adm', name: 'Administrativo' },
    ]),
  ),
  http.get('*/api/v1/fuelings/consumption', () =>
    HttpResponse.json({
      vehicles: [{ vehicleId: 'carro', vehiclePlate: 'ABC1D23', averageKmPerLiter: 10 }],
    }),
  ),
  http.get('*/api/v1/fuelings', () => HttpResponse.json([])),
  http.get('*/api/v1/maintenance-schedules/alerts', () =>
    HttpResponse.json([
      { id: 'alerta', vehiclePlate: 'ABC1D23', serviceName: 'Revisão', notes: 'Trocar filtro' },
    ]),
  ),
);

function renderPage(authenticated = true) {
  renderFleetPage(<DashboardPage />, '/dashboard', authenticated);
}

describe('DashboardPage', () => {
  it('abre diretamente e exibe a resposta da API quando a sessão é exigida', async () => {
    server.use(
      http.get('*/api/v1/vehicles', ({ request }) => {
        expect(request.headers.get('Authorization')).toBeNull();
        return HttpResponse.json({}, { status: 401 });
      }),
    );
    renderPage(false);
    expect(screen.getByRole('heading', { name: 'Visão geral da frota' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
    expect(
      await screen.findByText('A API exige uma sessão válida para exibir estes dados.'),
    ).toBeInTheDocument();
  });

  it('calcula indicadores, relaciona a viagem e filtra pelo setor do veículo', async () => {
    renderPage();
    expect(await screen.findByText('Motorista da API')).toBeInTheDocument();
    const card = screen.getByText('Em rota', { exact: true }).closest('article');
    expect(card).toHaveTextContent('1');
    expect(await screen.findByText('10 km/l')).toBeInTheDocument();
    fireEvent.change(await screen.findByRole('combobox', { name: 'Filtrar por setor' }), {
      target: { value: 'adm' },
    });
    expect(
      screen.getByText('Nenhuma viagem aberta para os filtros selecionados.'),
    ).toBeInTheDocument();
  });

  it('exibe os detalhes de alerta e mantém os demais painéis quando um endpoint dá erro', async () => {
    server.use(http.get('*/api/v1/fuelings', () => HttpResponse.json({}, { status: 403 })));
    renderPage();
    expect(
      await screen.findByText('Sua conta não tem permissão para acessar estes dados.'),
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Trocar filtro')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
  });
});

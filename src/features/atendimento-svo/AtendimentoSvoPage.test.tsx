import { fireEvent, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { AtendimentoSvoPage } from '@/features/atendimento-svo/AtendimentoSvoPage';
import { mockFleetApi, renderFleetPage } from '@/test/fleet-api';

const request = {
  id: 'b27ca111-20ee-42a5-a6ae-571523da2268',
  requesterSectorName: 'SVO',
  status: 'PENDING',
  requesterName: 'Pessoa solicitante',
  origin: 'Hospital da API',
  destination: 'Sede SVO',
  createdAt: '2026-11-18T17:00:00Z',
  purpose: 'Coleta',
};

const server = mockFleetApi(
  http.get('*/api/v1/trip-requests', () =>
    HttpResponse.json([
      request,
      { ...request, id: 'outro-id', requesterSectorName: 'Administrativo', origin: 'Fora do SVO' },
    ]),
  ),
  http.get('*/api/v1/trip-requests/:id', () => HttpResponse.json(request)),
  http.get('*/api/v1/svo/shifts/current', () =>
    HttpResponse.json([
      { id: 'plantao', teamName: 'Equipe retornada pela API', vehiclePlate: 'ABC1D23' },
    ]),
  ),
);

function renderPage() {
  renderFleetPage(<AtendimentoSvoPage />, '/atendimento-svo');
}

describe('AtendimentoSvoPage', () => {
  it('abre a fila e o plantão sem formulário de login', async () => {
    renderFleetPage(<AtendimentoSvoPage />, '/atendimento-svo', false);
    expect(screen.getByRole('heading', { name: 'Atendimento SVO' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Fila de atendimento' })).toBeInTheDocument();
    expect(await screen.findByText('Equipe retornada pela API')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprovar solicitação' })).not.toBeInTheDocument();
  });

  it('carrega detalhes, filtra a fila por setor e exibe plantões reais', async () => {
    renderPage();
    const queue = await screen.findByRole('region', { name: 'Fila de atendimento' });
    expect(within(queue).getByText('Hospital da API')).toBeInTheDocument();
    expect(within(queue).queryByText('Fora do SVO')).not.toBeInTheDocument();
    expect(await screen.findByText('Pessoa solicitante')).toBeInTheDocument();
    expect(await screen.findByText('Equipe retornada pela API')).toBeInTheDocument();
    fireEvent.change(within(queue).getByRole('textbox'), { target: { value: 'Outro local' } });
    expect(within(queue).queryByText('Hospital da API')).not.toBeInTheDocument();
  });

  it('envia aprovação com observação e atualiza o detalhe', async () => {
    const updated = { ...request, status: 'APPROVED', decisionNotes: 'Liberada pelo plantão' };
    server.use(
      http.patch('*/api/v1/trip-requests/:id/approve', async ({ params, request: req }) => {
        expect(params.id).toEqual(request.id);
        expect(await req.json()).toEqual({ decisionNotes: 'Liberada pelo plantão' });
        server.use(http.get('*/api/v1/trip-requests', () => HttpResponse.json([updated])));
        return HttpResponse.json(updated);
      }),
    );
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Aprovar solicitação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Observações da decisão'), {
      target: { value: 'Liberada pelo plantão' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByText('Solicitação aprovada.')).toBeInTheDocument();
    expect(await screen.findByText('Liberada pelo plantão')).toBeInTheDocument();
  });

  it('exige justificativa e mantém o diálogo aberto se a recusa falhar', async () => {
    server.use(
      http.patch('*/api/v1/trip-requests/:id/reject', async ({ request: req }) => {
        expect(await req.json()).toEqual({ rejectionReason: 'Informações divergentes' });
        return HttpResponse.json({ detail: 'A solicitação já foi atualizada.' }, { status: 409 });
      }),
    );
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Negar solicitação' }));
    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Confirmar' });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText(/Justificativa/), {
      target: { value: 'Informações divergentes' },
    });
    fireEvent.click(confirm);
    expect(await within(dialog).findByText('A solicitação já foi atualizada.')).toBeInTheDocument();
  });
});

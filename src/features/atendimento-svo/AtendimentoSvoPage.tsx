import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { ApiFeedback } from '@/shared/api/ApiFeedback';
import { useApiSession, type ApiUser } from '@/shared/api/use-api-session';
import { apiClient, apiData } from '@/shared/api/client';
import type { components } from '@/shared/api/generated/schema';
import './atendimento-svo.css';

type TripRequest = components['schemas']['TripRequestResponse'];
type RequestRow = {
  id: string;
  raw: TripRequest;
  status: string;
  enteredAt: string;
  wait: string;
  origin?: string;
  destination?: string;
  purpose?: string;
};
const statusLabels = {
  PENDING: 'Aguardando análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Negada',
  SCHEDULED: 'Agendada',
  CANCELED: 'Cancelada',
} as const;
const statusOptions = ['Todos', ...Object.values(statusLabels)];
const clock = new Intl.DateTimeFormat('pt-BR', {
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

function formatDate(value: string | undefined, formatter = dateTime) {
  return value ? formatter.format(new Date(value)) : '—';
}

type IconName = 'vehicle' | 'search' | 'logout';
function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    vehicle: (
      <>
        <path d="M3 14v-3l2-5h12l3 5v6h-2M3 14h14M6 17h.01M15 17h.01" />
        <circle cx="6" cy="17" r="2" />
        <circle cx="15" cy="17" r="2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4 4" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="svo-icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(' ', '-');
  return <span className={`svo-status-badge status-${className}`}>{status}</span>;
}

function Sidebar({ session }: { session?: ApiUser }) {
  return (
    <aside className="svo-sidebar">
      <div className="svo-brand">
        <div className="brand-title">SVO</div>
        <div>Frota administrativa</div>
        <div>Serviço de Verificação de Óbito</div>
      </div>
      <nav aria-label="Navegação institucional" className="side-nav">
        <Link className="side-link" to="/solicitacoes">
          <Icon name="vehicle" size={20} />
          Solicitações
        </Link>
        <Link aria-current="page" className="side-link side-link-active" to="/atendimento-svo">
          <Icon name="vehicle" size={20} />
          Atendimento SVO
        </Link>
        <Link className="side-link side-link-secondary" to="/usuarios">
          Usuários
        </Link>
      </nav>
      <div className="side-context">
        <span>ATENDENTE / SVO</span>
        <p>
          Análise e aprovação SVO.
          <br />
          Alocação de equipes e veículos pela Logística.
        </p>
      </div>
      <div className="side-user">
        <div className="svo-user-avatar">{session?.initials ?? 'SVO'}</div>
        <div>
          <strong>{session?.name ?? 'Atendimento SVO'}</strong>
          {session?.role && <span>{session.role}</span>}
        </div>
      </div>
      {session && (
        <button type="button" className="side-logout" onClick={session.logout}>
          <Icon name="logout" /> Sair
        </button>
      )}
    </aside>
  );
}

function SummaryItem({
  number,
  title,
  detail,
}: {
  number: number | string;
  title: string;
  detail: string;
}) {
  return (
    <div className="summary-item">
      <strong>{number}</strong>
      <div>
        <b>{title}</b>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="page-header">
      <div className="header-main">
        <div className="breadcrumbs">
          <Link to="/">SVO</Link>
          <span>/</span>
          <Link to="/dashboard">Frota administrativa</Link>
          <span>/</span>
          <strong>Atendimento SVO</strong>
        </div>
        <h1>Atendimento SVO</h1>
        <p className="header-subtitle">Triagem de solicitações do setor SVO</p>
      </div>
    </header>
  );
}

function Queue({
  requests,
  selectedId,
  onSelect,
}: {
  requests: RequestRow[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('Todos');
  const filtered = useMemo(
    () =>
      requests.filter((request) => {
        const search = query.trim().toLocaleLowerCase('pt-BR');
        const matches =
          !search ||
          [request.id, request.origin ?? '', request.destination ?? ''].some((value) =>
            value.toLocaleLowerCase('pt-BR').includes(search),
          );
        return matches && (status === 'Todos' || request.status === status);
      }),
    [query, requests, status],
  );
  return (
    <section aria-labelledby="queue-title" className="surface queue-panel">
      <div className="section-heading queue-heading">
        <div>
          <h2 id="queue-title">Fila de atendimento</h2>
          <p>
            {requests.length} solicitações SVO •{' '}
            {requests.filter((r) => r.raw.status === 'PENDING').length} triagens pendentes
          </p>
        </div>
        <div className="queue-tools">
          <label className="search-field">
            <Icon name="search" size={14} />
            <TextField
              aria-label="Buscar ID, coleta ou destino"
              className="queue-search-input"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar protocolo, coleta ou destino"
              slotProps={{ input: { disableUnderline: true } }}
              variant="standard"
              value={query}
            />
          </label>
          <label className="status-select">
            <span className="svo-visually-hidden">Status</span>
            <Select
              aria-label="Status"
              className="queue-status-select"
              disableUnderline
              onChange={(e) => setStatus(e.target.value as (typeof statusOptions)[number])}
              value={status}
              variant="standard"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'Todos' ? 'Status: Todos' : option}
                </MenuItem>
              ))}
            </Select>
          </label>
        </div>
      </div>
      <div
        className="svo-table-scroll"
        role="region"
        aria-label="Tabela da fila; role para rolagem horizontal"
        tabIndex={0}
      >
        <table className="data-table queue-table">
          <thead>
            <tr>
              {['ID', 'Status', 'Entrada', 'Espera', 'Finalidade', 'Coleta', 'Destino'].map(
                (label) => (
                  <th key={label}>{label}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((request) => {
              return (
                <tr
                  aria-selected={selectedId === request.id}
                  className={selectedId === request.id ? 'selected-row' : ''}
                  key={request.id}
                  onClick={() => onSelect(request.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelect(request.id);
                  }}
                  tabIndex={0}
                >
                  <td className="svo-protocol-cell" title={request.id}>
                    {request.id.slice(0, 8)}
                  </td>
                  <td>
                    <StatusBadge status={request.status} />
                    {request.status === 'Aprovada' && (
                      <small className="sub-status">Aguardando alocação</small>
                    )}
                  </td>
                  <td>{request.enteredAt}</td>
                  <td className={request.wait !== '—' ? 'wait-cell' : ''}>{request.wait}</td>
                  <td>{request.purpose}</td>
                  <td>{request.origin}</td>
                  <td>{request.destination}</td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td className="empty-row" colSpan={7}>
                  Nenhuma solicitação corresponde à busca e ao status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="queue-footer">
        <span>
          Exibindo {filtered.length} de {requests.length} solicitações
        </span>
        <span>
          Selecionada: <strong>{requests.find((r) => r.id === selectedId)?.id.slice(0, 8)}</strong>
        </span>
      </div>
    </section>
  );
}

function SvoContent({ session }: { session?: ApiUser }) {
  const cache = useQueryClient();
  const [selection, setSelection] = useState<string>();
  const [decision, setDecision] = useState<{ id: string; kind: 'approve' | 'reject' }>();
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const requests = useQuery({
    queryKey: ['trip-requests'],
    refetchInterval: 60_000,
    queryFn: async ({ signal }) =>
      apiData(await apiClient.GET('/api/v1/trip-requests', { signal })),
  });
  const rows = useMemo(
    () =>
      (requests.data ?? []).flatMap((raw): RequestRow[] => {
        const sector = raw.requesterSectorName?.trim().toLocaleLowerCase('pt-BR');
        if (
          !raw.id ||
          !sector ||
          !['svo', 'serviço de verificação de óbito', 'serviço de verificação de óbitos'].includes(
            sector,
          )
        )
          return [];
        const elapsed =
          raw.createdAt && raw.status === 'PENDING'
            ? Math.max(0, Math.floor((requests.dataUpdatedAt - Date.parse(raw.createdAt)) / 60_000))
            : undefined;
        return [
          {
            id: raw.id,
            raw,
            status: raw.status ? statusLabels[raw.status] : '—',
            enteredAt: formatDate(raw.createdAt, clock),
            wait: elapsed === undefined ? '—' : elapsed + ' min',
            origin: raw.origin,
            destination: raw.destination,
            purpose: raw.purpose,
          },
        ];
      }),
    [requests.data, requests.dataUpdatedAt],
  );
  const selectedId = rows.find((row) => row.id === selection)?.id ?? rows[0]?.id;
  const details = useQuery({
    queryKey: ['trip-request', selectedId],
    enabled: Boolean(selectedId),
    queryFn: async ({ signal }) => {
      if (!selectedId) throw new Error('Solicitação ausente');
      return apiData(
        await apiClient.GET('/api/v1/trip-requests/{id}', {
          signal,
          params: { path: { id: selectedId } },
        }),
      );
    },
  });
  const shifts = useQuery({
    queryKey: ['svo-shifts-current'],
    queryFn: async ({ signal }) =>
      apiData(await apiClient.GET('/api/v1/svo/shifts/current', { signal })),
    refetchInterval: 60_000,
  });
  const decide = useMutation({
    mutationFn: async ({
      id,
      kind,
      reason,
    }: {
      id: string;
      kind: 'approve' | 'reject';
      reason: string;
    }) => {
      const params = { path: { id } };
      return kind === 'approve'
        ? apiData(
            await apiClient.PATCH('/api/v1/trip-requests/{id}/approve', {
              params,
              body: reason ? { decisionNotes: reason } : {},
            }),
          )
        : apiData(
            await apiClient.PATCH('/api/v1/trip-requests/{id}/reject', {
              params,
              body: { rejectionReason: reason },
            }),
          );
    },
    onSuccess: async (updated, { id, kind }) => {
      cache.setQueryData(['trip-request', id], updated);
      cache.setQueryData<TripRequest[]>(['trip-requests'], (items) =>
        items?.map((item) => (item.id === id ? updated : item)),
      );
      setDecision(undefined);
      setFeedback(kind === 'approve' ? 'Solicitação aprovada.' : 'Negativa registrada.');
      await cache.invalidateQueries({ queryKey: ['trip-requests'] });
    },
  });
  const request = details.data;
  function openDecision(id: string, kind: 'approve' | 'reject') {
    decide.reset();
    setNote('');
    setFeedback('');
    setDecision({ id, kind });
  }

  return (
    <>
      <section aria-label="Resumo da operação" className="summary-grid">
        <SummaryItem
          number={requests.data ? rows.filter(({ raw }) => raw.status === 'PENDING').length : '—'}
          title="Triagens pendentes"
          detail="Solicitações SVO pendentes"
        />
        <SummaryItem
          number={requests.data ? rows.filter(({ raw }) => raw.status === 'APPROVED').length : '—'}
          title="Aguardando alocação"
          detail="Solicitações SVO aprovadas"
        />
        <SummaryItem
          number={shifts.data?.length ?? '—'}
          title="Plantões atuais"
          detail="Escala operacional SVO"
        />
      </section>
      {requests.isPending && <p role="status">Carregando solicitações…</p>}
      {requests.isError && (
        <ApiFeedback error={requests.error} retry={() => void requests.refetch()} />
      )}
      {requests.data && <Queue requests={rows} selectedId={selectedId} onSelect={setSelection} />}
      <div className="detail-grid">
        <section className="surface request-card" aria-labelledby="live-request-title">
          <div className="request-card-header">
            <div>
              <span className="eyebrow">SOLICITAÇÃO SELECIONADA</span>
              <h2 id="live-request-title">{selectedId?.slice(0, 8) ?? 'Detalhes'}</h2>
            </div>
            {request?.status && <StatusBadge status={statusLabels[request.status]} />}
          </div>
          {selectedId && details.isPending && (
            <p className="request-facts" role="status">
              Carregando detalhes…
            </p>
          )}
          {details.isError && (
            <ApiFeedback error={details.error} retry={() => void details.refetch()} />
          )}
          {!selectedId && <p className="request-facts">Selecione uma solicitação na fila.</p>}
          {request && (
            <>
              <div className="request-facts">
                <Fact label="Coleta" value={request.origin ?? '—'} />
                <Fact label="Destino" value={request.destination ?? '—'} />
                <Fact label="Solicitante" value={request.requesterName ?? '—'} />
                <Fact label="Entrada" value={formatDate(request.createdAt)} />
                <Fact label="Finalidade" value={request.purpose ?? '—'} />
                <Fact label="Saída prevista" value={formatDate(request.departureAt)} />
                <Fact label="Passageiros" value={request.passengerCount?.toString() ?? '—'} />
                <Fact label="ID da solicitação" value={selectedId ?? '—'} />
              </div>
              {(request.decidedAt || request.decisionNotes || request.rejectionReason) && (
                <div className="request-notes">
                  <h3>Decisão registrada</h3>
                  <p>
                    {[request.decidedByName, formatDate(request.decidedAt)]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                  <p>{request.decisionNotes ?? request.rejectionReason}</p>
                </div>
              )}
              <div className="analysis-area">
                {request.status === 'PENDING' &&
                  selectedId &&
                  session?.permissions.includes('TRIP_REQUESTS_MANAGE') && (
                    <div className="action-buttons">
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => openDecision(selectedId, 'approve')}
                      >
                        Aprovar solicitação
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => openDecision(selectedId, 'reject')}
                      >
                        Negar solicitação
                      </Button>
                    </div>
                  )}
                <p className="workflow-note">
                  Rascunhos de análise, complementos e histórico completo ainda não estão
                  disponíveis na API.
                </p>
                {feedback && <Alert severity="success">{feedback}</Alert>}
              </div>
            </>
          )}
        </section>
        <section className="surface duty-panel" aria-labelledby="duty-title">
          <div className="duty-heading">
            <h2 id="duty-title">Equipe de plantão</h2>
            <p>Plantões atuais cadastrados no SVO</p>
          </div>
          {shifts.isPending && (
            <p className="team-row" role="status">
              Carregando plantões…
            </p>
          )}
          {shifts.isError && (
            <ApiFeedback error={shifts.error} retry={() => void shifts.refetch()} />
          )}
          {shifts.data?.length === 0 && <p className="team-row">Nenhum plantão vigente.</p>}
          {shifts.data?.map((shift) => (
            <div className="team-row" key={shift.id}>
              <div className="team-top">
                <strong>{shift.teamName ?? 'Equipe'}</strong>
              </div>
              <span>
                {shift.teamMembers
                  ?.filter((member) => member.active !== false)
                  .map((member) => member.userName)
                  .filter(Boolean)
                  .join(', ') || 'Equipe sem integrantes informados'}
              </span>
              <span>
                {[shift.vehicleModel, shift.vehiclePlate].filter(Boolean).join(' • ') ||
                  'Veículo não informado'}
              </span>
              <small>
                {formatDate(shift.startAt)} – {formatDate(shift.endAt)}
              </small>
            </div>
          ))}
        </section>
      </div>
      <Dialog
        open={Boolean(decision)}
        onClose={() => {
          if (!decide.isPending) setDecision(undefined);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="svo-decision-title"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (decision && !decide.isPending && (decision.kind === 'approve' || note.trim())) {
              decide.mutate({ ...decision, reason: note.trim() });
            }
          }}
        >
          <DialogTitle id="svo-decision-title">
            {decision?.kind === 'reject' ? 'Confirmar negativa' : 'Confirmar aprovação'}
          </DialogTitle>
          <DialogContent>
            <p>Solicitação {decision?.id.slice(0, 8)}</p>
            <TextField
              fullWidth
              multiline
              minRows={3}
              required={decision?.kind === 'reject'}
              label={decision?.kind === 'reject' ? 'Justificativa' : 'Observações da decisão'}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            {decide.isError && <ApiFeedback error={decide.error} />}
          </DialogContent>
          <DialogActions>
            <Button disabled={decide.isPending} onClick={() => setDecision(undefined)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={decide.isPending || (decision?.kind === 'reject' && !note.trim())}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AtendimentoSvoPage() {
  const session = useApiSession();
  return (
    <div className="svo-app-shell">
      <Sidebar session={session} />
      <main className="svo-main">
        <PageHeader />
        <SvoContent session={session} />
      </main>
    </div>
  );
}

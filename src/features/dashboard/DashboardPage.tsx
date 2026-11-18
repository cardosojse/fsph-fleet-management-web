import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { ApiFeedback } from '@/shared/api/ApiFeedback';
import { useApiSession } from '@/shared/api/use-api-session';
import { apiClient, apiData } from '@/shared/api/client';
import type { components } from '@/shared/api/generated/schema';
import { DashboardSidebar } from './components/DashboardSidebar';
import './dashboard.css';

function MetricIcon({ name }: { name: string }) {
  if (name === 'grid')
    return (
      <svg viewBox="0 0 20 20">
        <rect x="2" y="3" width="7" height="6" rx="1" />
        <rect x="11" y="3" width="7" height="6" rx="1" />
        <rect x="2" y="11" width="7" height="6" rx="1" />
        <rect x="11" y="11" width="7" height="6" rx="1" />
      </svg>
    );
  if (name === 'route')
    return (
      <svg viewBox="0 0 20 20">
        <circle cx="5" cy="5" r="2" />
        <circle cx="15" cy="15" r="2" />
        <path d="M7 5h5a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h5" />
      </svg>
    );
  if (name === 'tool')
    return (
      <svg viewBox="0 0 20 20">
        <path d="M3 8h14l2 3v5H1v-5zM6 8l1-4h6l1 4M5 16v2m10-2v2M5 12h.01m10 0h.01" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20">
      <path d="M2 13v-3l2-5h11l3 5v5h-2M2 13h13M5 16h.01M14 16h.01" />
      <circle cx="5" cy="15" r="2" />
      <circle cx="14" cy="15" r="2" />
    </svg>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="dashboard-filter">
      <span className="visually-hidden">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </label>
  );
}

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateKey = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' });
const time = new Intl.DateTimeFormat('pt-BR', {
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

type Trip = components['schemas']['TripResponse'];
type FleetAlert = { id: string; title: string; description: string };

function formatNumber(value: number | null | undefined, unit = '') {
  return value == null ? '—' : number.format(value) + unit;
}

function formatDate(value?: string) {
  return value?.split('-').reverse().join('/') || '—';
}

async function loadOpenTrips(signal: AbortSignal) {
  const trips: Trip[] = [];
  let pages = 1;
  for (let page = 0; page < pages; page += 1) {
    const result = apiData(
      await apiClient.GET('/api/v1/trips', { signal, params: { query: { page, size: 100 } } }),
    );
    trips.push(...(result.content ?? []).filter((trip) => trip.status === 'OPEN'));
    pages = result.totalPages ?? 1;
  }
  return trips;
}

function DashboardContent() {
  const [period, setPeriod] = useState<'today' | 'week' | 'all'>('today');
  const [sector, setSector] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FleetAlert>();
  const requests = useQuery({
    queryKey: ['trip-requests'],
    queryFn: async ({ signal }) =>
      apiData(await apiClient.GET('/api/v1/trip-requests', { signal })),
  });
  const vehicles = useQuery({
    queryKey: ['vehicles'],
    queryFn: async ({ signal }) => apiData(await apiClient.GET('/api/v1/vehicles', { signal })),
  });
  const trips = useQuery({
    queryKey: ['open-trips'],
    queryFn: ({ signal }) => loadOpenTrips(signal),
  });
  const drivers = useQuery({
    queryKey: ['drivers'],
    queryFn: async ({ signal }) => apiData(await apiClient.GET('/api/v1/drivers', { signal })),
  });
  const sectors = useQuery({
    queryKey: ['sectors'],
    queryFn: async ({ signal }) => apiData(await apiClient.GET('/api/v1/sectors', { signal })),
  });
  const consumption = useQuery({
    queryKey: ['fuel-consumption'],
    queryFn: async ({ signal }) =>
      apiData(await apiClient.GET('/api/v1/fuelings/consumption', { signal })),
  });
  const fuelings = useQuery({
    queryKey: ['fuelings'],
    queryFn: async ({ signal }) => apiData(await apiClient.GET('/api/v1/fuelings', { signal })),
  });
  const maintenanceAlerts = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async ({ signal }) =>
      apiData(await apiClient.GET('/api/v1/maintenance-schedules/alerts', { signal })),
  });

  const openVehicleIds = new Set(trips.data?.map((trip) => trip.vehicleId));
  const fleet = (vehicles.data ?? []).filter((vehicle) => vehicle.active);
  const maintenance = fleet.filter((vehicle) => vehicle.inMaintenance);
  const onRoute = fleet.filter(
    (vehicle) => !vehicle.inMaintenance && openVehicleIds.has(vehicle.id),
  );
  const available = fleet.filter(
    (vehicle) => !vehicle.inMaintenance && vehicle.available && !openVehicleIds.has(vehicle.id),
  );
  const fleetReady = Boolean(vehicles.data && trips.data);
  const indicators = [
    {
      label: 'Disponíveis',
      value: fleetReady ? available.length : undefined,
      icon: 'grid',
      color: 'blue',
    },
    {
      label: 'Em rota',
      value: fleetReady ? onRoute.length : undefined,
      icon: 'route',
      color: 'green',
    },
    {
      label: 'Em manutenção',
      value: vehicles.data ? maintenance.length : undefined,
      icon: 'tool',
      color: 'orange',
    },
    {
      label: 'Indisponíveis',
      value: fleetReady
        ? fleet.length - onRoute.length - maintenance.length - available.length
        : undefined,
      icon: 'car',
      color: 'red',
    },
  ];

  const today = new Date();
  const dayKeys = Array.from({ length: 7 }, (_, index) =>
    dateKey.format(today.getTime() - (6 - index) * 86_400_000),
  );
  const todayKey = dateKey.format(today);
  const requestsByDay = new Map<string, number>();
  for (const request of requests.data ?? []) {
    if (!request.createdAt) continue;
    const day = dateKey.format(new Date(request.createdAt));
    requestsByDay.set(day, (requestsByDay.get(day) ?? 0) + 1);
  }
  const maxRequests = Math.max(1, ...dayKeys.map((day) => requestsByDay.get(day) ?? 0));
  const vehicleById = new Map(vehicles.data?.map((vehicle) => [vehicle.id, vehicle]));
  const driverById = new Map(drivers.data?.map((driver) => [driver.id, driver]));
  const sectorById = new Map(sectors.data?.map((item) => [item.id, item.name]));
  const visibleTrips = (trips.data ?? []).filter((trip) => {
    if (sector && vehicleById.get(trip.vehicleId)?.sectorId !== sector) return false;
    if (period === 'all') return true;
    const startDay = trip.startedAt ? dateKey.format(new Date(trip.startedAt)) : '';
    return period === 'today'
      ? startDay === todayKey
      : startDay >= (dayKeys[0] ?? todayKey) && startDay <= todayKey;
  });
  const latestFuelings = [...(fuelings.data ?? [])]
    .sort((a, b) => (b.fueledOn ?? '').localeCompare(a.fueledOn ?? ''))
    .slice(0, 5);
  const alerts: FleetAlert[] = (maintenanceAlerts.data ?? []).map((alert) => ({
    id: alert.id ?? '',
    title:
      [alert.vehiclePlate, alert.serviceName].filter(Boolean).join(' — ') || 'Alerta de manutenção',
    description:
      [
        alert.targetDate && 'Previsão: ' + formatDate(alert.targetDate),
        alert.targetOdometerKm != null &&
          'Odômetro previsto: ' + formatNumber(alert.targetOdometerKm, ' km'),
        alert.notes,
      ]
        .filter(Boolean)
        .join(' • ') || 'Consulte o plano de manutenção.',
  }));

  return (
    <>
      <div className="fleet-kpis">
        {indicators.map((indicator) => (
          <article className="fleet-kpi" key={indicator.label}>
            <div className="kpi-caption">
              <span className={'kpi-icon ' + indicator.color}>
                <MetricIcon name={indicator.icon} />
              </span>
              <span>Frota ativa</span>
            </div>
            <strong className="kpi-value">{indicator.value ?? '—'}</strong>
            <span className="kpi-label">{indicator.label}</span>
          </article>
        ))}
      </div>
      {vehicles.isError && (
        <ApiFeedback error={vehicles.error} retry={() => void vehicles.refetch()} />
      )}
      <div className="dashboard-overview-grid">
        <section className="dashboard-panel triage-panel" aria-labelledby="triage-heading">
          <div className="panel-heading">
            <h2 id="triage-heading">Triagem e alocação</h2>
          </div>
          {requests.isError && (
            <ApiFeedback error={requests.error} retry={() => void requests.refetch()} />
          )}
          <div className="triage-stats">
            {[
              [
                'Triagens pendentes',
                requests.data?.filter((request) => request.status === 'PENDING').length,
              ],
              [
                'Aloc. pendentes',
                requests.data?.filter((request) => request.status === 'APPROVED').length,
              ],
              ['Solicitações hoje', requests.data && (requestsByDay.get(todayKey) ?? 0)],
              ['Viagens abertas', trips.data?.length],
            ].map(([label, value]) => (
              <div className="triage-stat" key={label}>
                <span>{label}</span>
                <strong>{value ?? '—'}</strong>
              </div>
            ))}
          </div>
        </section>
        <section
          className="dashboard-panel request-chart-panel"
          aria-labelledby="requests-chart-heading"
        >
          <div className="panel-heading">
            <h2 id="requests-chart-heading">Solicitações / dia</h2>
            <span>Últimos 7 dias</span>
          </div>
          {requests.isPending && <p role="status">Carregando solicitações…</p>}
          {requests.isError && <p>Não foi possível carregar a série.</p>}
          {requests.data && (
            <div
              className="request-chart"
              role="img"
              aria-label={dayKeys
                .map((day) => formatDate(day) + ': ' + (requestsByDay.get(day) ?? 0))
                .join(', ')}
            >
              {dayKeys.map((day) => (
                <div className="chart-column" key={day}>
                  <div className="chart-track">
                    <span
                      className={'chart-bar' + (day === todayKey ? ' highlight' : '')}
                      style={{ height: ((requestsByDay.get(day) ?? 0) / maxRequests) * 100 + '%' }}
                    />
                  </div>
                  <small>{formatDate(day).slice(0, 5)}</small>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="dashboard-panel status-panel" aria-labelledby="fleet-status-heading">
          <h2 id="fleet-status-heading">Frota por status • {vehicles.data ? fleet.length : '—'}</h2>
          {indicators.map(({ label, value }) => (
            <div className="status-meter" key={label}>
              <span>
                {label} · {value ?? '—'}
              </span>
              <div>
                <i style={{ width: ((value ?? 0) / Math.max(1, fleet.length)) * 100 + '%' }} />
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="dashboard-panel routes-panel" aria-labelledby="active-routes-heading">
        <div className="panel-heading panel-heading-wrap">
          <div>
            <h2 id="active-routes-heading">Viagens em andamento</h2>
            <p>
              Protocolo, coleta, destino e ocupação dependem do vínculo entre viagem e solicitação
              na API.
            </p>
          </div>
          <div className="table-filters">
            {sectors.data && vehicles.data && (
              <FilterSelect
                label="Filtrar por setor"
                value={sector}
                onChange={setSector}
                options={[
                  { value: '', label: 'Todos os setores' },
                  ...sectors.data.flatMap((item) =>
                    item.id && item.name ? [{ value: item.id, label: item.name }] : [],
                  ),
                ]}
              />
            )}
            <FilterSelect
              label="Filtrar por período"
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'today', label: 'Período: Hoje' },
                { value: 'week', label: 'Período: Últimos 7 dias' },
                { value: 'all', label: 'Período: Todo o período' },
              ]}
            />
          </div>
        </div>
        {trips.isPending && <p role="status">Carregando viagens…</p>}
        {trips.isError && <ApiFeedback error={trips.error} retry={() => void trips.refetch()} />}
        {drivers.isError && (
          <ApiFeedback error={drivers.error} retry={() => void drivers.refetch()} />
        )}
        {sectors.isError && (
          <ApiFeedback error={sectors.error} retry={() => void sectors.refetch()} />
        )}
        {trips.data && (
          <div className="table-scroll">
            <table className="fleet-table live-trips-table">
              <thead>
                <tr>
                  {['Viagem', 'Setor do veículo', 'Motorista', 'Veículo', 'Início', 'Status'].map(
                    (label) => (
                      <th key={label}>{label}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleTrips.map((trip) => {
                  const vehicle = vehicleById.get(trip.vehicleId);
                  return (
                    <tr key={trip.id}>
                      <td className="protocol-cell" title={trip.id}>
                        {trip.id?.slice(0, 8) ?? '—'}
                      </td>
                      <td>{sectorById.get(vehicle?.sectorId) ?? '—'}</td>
                      <td>{driverById.get(trip.driverId)?.name ?? '—'}</td>
                      <td>{[vehicle?.model, vehicle?.plate].filter(Boolean).join(' • ') || '—'}</td>
                      <td>
                        {trip.startedAt
                          ? formatDate(dateKey.format(new Date(trip.startedAt))) +
                            ' ' +
                            time.format(new Date(trip.startedAt))
                          : '—'}
                      </td>
                      <td>
                        <span className="status-badge in-progress">Em execução</span>
                      </td>
                    </tr>
                  );
                })}
                {visibleTrips.length === 0 && (
                  <tr>
                    <td className="empty-table" colSpan={6}>
                      Nenhuma viagem aberta para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel compact-panel">
          <div className="panel-heading">
            <h2>Consumo / veículo</h2>
            <strong className="mini-unit">km/l</strong>
          </div>
          {consumption.isError && (
            <ApiFeedback error={consumption.error} retry={() => void consumption.refetch()} />
          )}
          {consumption.isPending && <p role="status">Carregando consumo…</p>}
          {consumption.data && !consumption.data.vehicles?.length && (
            <p>Sem registros de consumo.</p>
          )}
          {consumption.data?.vehicles?.slice(0, 5).map((item) => (
            <div className="vehicle-metric" key={item.vehicleId}>
              <span>
                <strong>{item.vehiclePlate ?? item.vehicleModel ?? 'Veículo'}</strong>
                <small>{formatNumber(item.totalMeasuredDistanceKm, ' km medidos')}</small>
              </span>
              <b>{formatNumber(item.averageKmPerLiter, ' km/l')}</b>
            </div>
          ))}
        </section>
        <section className="dashboard-panel compact-panel">
          <div className="panel-heading">
            <h2>Abastecimentos recentes</h2>
          </div>
          {fuelings.isError && (
            <ApiFeedback error={fuelings.error} retry={() => void fuelings.refetch()} />
          )}
          {fuelings.isPending && <p role="status">Carregando abastecimentos…</p>}
          {fuelings.data?.length === 0 && <p>Sem abastecimentos registrados.</p>}
          {latestFuelings.map((item) => (
            <div className="vehicle-metric" key={item.id}>
              <span>
                <strong>{item.vehiclePlate ?? item.vehicleModel ?? 'Veículo'}</strong>
                <small>
                  {formatDate(item.fueledOn)} • {formatNumber(item.liters, ' L')}
                </small>
              </span>
              <b>{item.totalValue == null ? '—' : currency.format(item.totalValue)}</b>
            </div>
          ))}
        </section>
        <section className="dashboard-panel alerts-panel">
          <div className="panel-heading">
            <h2>Alertas de manutenção</h2>
          </div>
          {maintenanceAlerts.isError && (
            <ApiFeedback
              error={maintenanceAlerts.error}
              retry={() => void maintenanceAlerts.refetch()}
            />
          )}
          {maintenanceAlerts.isPending && <p role="status">Carregando alertas…</p>}
          {maintenanceAlerts.data?.length === 0 && <p>Nenhum alerta de manutenção.</p>}
          {alerts.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <span className="kpi-icon orange">
                <MetricIcon name="tool" />
              </span>
              <div>
                <strong>{alert.title}</strong>
                <small>{alert.description}</small>
              </div>
              <button className="text-action" type="button" onClick={() => setSelectedAlert(alert)}>
                Abrir
              </button>
            </article>
          ))}
        </section>
      </div>
      <Dialog
        open={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(undefined)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{selectedAlert?.title}</DialogTitle>
        <DialogContent>{selectedAlert?.description}</DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAlert(undefined)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function DashboardPage() {
  const session = useApiSession();
  return (
    <div className="dashboard-shell dashboard-page">
      <DashboardSidebar session={session ?? null} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-breadcrumb">
            <span>SVO</span> / <span>Frota administrativa</span> / <strong>Dashboard</strong>
          </div>
          <h1>Visão geral da frota</h1>
          <p>Indicadores operacionais da frota</p>
          {session && (
            <div className="dashboard-user-bar">
              <div className="user-summary">
                <span className="user-summary-badge">{session.initials}</span>
                <strong>{session.name}</strong>
              </div>
              <button type="button" className="exit-button" onClick={session.logout}>
                Sair
              </button>
            </div>
          )}
        </header>
        <DashboardContent />
      </main>
    </div>
  );
}

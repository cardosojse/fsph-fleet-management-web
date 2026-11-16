import AltRouteOutlined from '@mui/icons-material/AltRouteOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { tokens } from '@/app/theme';
import { authToken } from '@/shared/api/auth-token';
import { AppLayout } from '@/shared/layout/AppLayout';

import type { DashboardData } from './dashboard.types';
import { loadDemoDashboard } from './mocks/dashboard';

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Fortaleza',
});
const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Fortaleza',
});
const dayFormat = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Fortaleza',
});
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type Detail = { title: string; description: string };

function Card({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Paper component="section" variant="outlined" sx={{ minWidth: 0, height: '100%' }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.75,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography component="h2" variant="h3">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Typography
      role="status"
      variant="body2"
      color="text.secondary"
      sx={{ py: 3, textAlign: 'center' }}
    >
      {children}
    </Typography>
  );
}

export function DashboardPage({ demo = false }: { demo?: boolean }) {
  // Token presence preserves the existing client boundary; the backend must validate real sessions.
  if (!demo && !authToken.get()) return <Navigate to="/login" replace />;
  return <DashboardContent />;
}

function DashboardContent() {
  const [detail, setDetail] = useState<Detail | null>(null);
  const dashboard = useQuery({
    queryKey: ['dashboard', 'demo'],
    queryFn: loadDemoDashboard,
    retry: false,
  });
  return (
    <AppLayout
      active="dashboard"
      title="Visão geral da frota"
      breadcrumbs={[
        { label: 'SVO', to: '/' },
        { label: 'Frota administrativa' },
        { label: 'Dashboard' },
      ]}
      subtitle={
        dashboard.data && (
          <>
            Período: {dashboard.data.period} • Atualização dos dados fictícios:{' '}
            {dateFormat.format(new Date(dashboard.data.updatedAt))}
          </>
        )
      }
      actions={
        dashboard.data && (
          <Button
            variant="outlined"
            startIcon={dashboard.isFetching ? <CircularProgress size={16} /> : <RefreshRounded />}
            disabled={dashboard.isFetching}
            onClick={() => void dashboard.refetch()}
            sx={{ flexShrink: 0 }}
          >
            {dashboard.isFetching ? 'Atualizando…' : 'Atualizar dados'}
          </Button>
        )
      }
    >
      <Stack spacing={3}>
        <Alert severity="info">
          Modo demonstrativo: dados históricos fictícios da referência (outubro de 2026). A API do
          dashboard ainda não está integrada. Este perfil não representa permissões autenticadas.
        </Alert>
        {dashboard.isPending ? (
          <Stack role="status" sx={{ alignItems: 'center', p: 8 }} spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Carregando dashboard…</Typography>
          </Stack>
        ) : dashboard.isError && !dashboard.data ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void dashboard.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar o dashboard.
          </Alert>
        ) : (
          <>
            {dashboard.isRefetchError && (
              <Alert severity="warning">
                Falha ao atualizar. Os dados anteriores foram mantidos. Tente atualizar novamente.
              </Alert>
            )}
            <DashboardSections data={dashboard.data} onDetail={setDetail} />
          </>
        )}
      </Stack>
      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="dashboard-detail-title"
      >
        <DialogTitle id="dashboard-detail-title">{detail?.title}</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line' }} color="text.secondary">
            {detail?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}

interface Kpi {
  label: string;
  value: number;
  hint: string;
  icon: SvgIconComponent;
  color: string;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Icon aria-hidden sx={{ fontSize: 18, color: kpi.color }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {kpi.label}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 700, lineHeight: 1.2, mt: 1 }}>
        {kpi.value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {kpi.hint}
      </Typography>
    </Paper>
  );
}

function DashboardSections({
  data,
  onDetail,
}: {
  data: DashboardData;
  onDetail: (detail: Detail) => void;
}) {
  const [sector, setSector] = useState('all');
  const [period, setPeriod] = useState('all');
  const clearFilters = () => {
    setSector('all');
    setPeriod('all');
  };
  const routes = data.routes.filter(
    (route) =>
      (sector === 'all' || route.sector === sector) &&
      (period === 'all' ||
        dayFormat.format(new Date(route.startsAt)) === dayFormat.format(new Date())),
  );
  const total = Object.values(data.fleet).reduce((sum, value) => sum + value, 0);
  const peak = Math.max(1, ...data.dailyRequests.map((day) => day.count));
  const { success, warning, error, info } = tokens.status;
  const kpis: Kpi[] = [
    {
      label: 'Disponíveis',
      value: data.fleet.available,
      hint: `${total ? Math.round((data.fleet.available / total) * 100) : 0}% da frota`,
      icon: CheckCircleOutlineRounded,
      color: success.fg,
    },
    {
      label: 'Em rota',
      value: data.fleet.inRoute,
      hint: `${data.fleet.inRoute} em execução`,
      icon: AltRouteOutlined,
      color: info.fg,
    },
    {
      label: 'Em manutenção',
      value: data.fleet.maintenance,
      hint: `${data.fleet.maintenance} veículo(s)`,
      icon: BuildOutlined,
      color: warning.fg,
    },
    {
      label: 'Indisponíveis',
      value: data.fleet.unavailable,
      hint: `${data.fleet.unavailable} veículo(s)`,
      icon: BlockOutlined,
      color: error.fg,
    },
  ];

  return (
    <>
      <Box
        component="section"
        aria-label="Indicadores da frota"
        sx={{
          display: 'grid',
          gap: { xs: 1.5, md: 2 },
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr)',
          },
        }}
      >
        <Card title="Triagem e alocação">
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              '& > div': { p: 1.5 },
              '& > div:nth-of-type(odd)': { borderRight: 1, borderRightColor: 'divider' },
              '& > div:nth-of-type(-n+2)': { borderBottom: 1, borderBottomColor: 'divider' },
            }}
          >
            {[
              ['Triagens pendentes', data.triage.pending],
              ['Aloc. pendentes', data.triage.allocation],
              ['Solicitações / dia', data.triage.requestsToday],
              ['Rotas ativas', data.routes.length],
            ].map(([label, value]) => (
              <div key={label}>
                <Typography component="dt" variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography component="dd" sx={{ m: 0, fontSize: 24, fontWeight: 700 }}>
                  {value}
                </Typography>
              </div>
            ))}
          </Box>
        </Card>

        <Card title="Solicitações / dia" subtitle={data.period}>
          {data.dailyRequests.length === 0 ? (
            <EmptyState>Sem histórico de solicitações.</EmptyState>
          ) : (
            <Box component="figure" sx={{ m: 0 }}>
              <Box
                role="img"
                aria-label={data.dailyRequests
                  .map((day) => `${day.date}: ${day.count} solicitações`)
                  .join('; ')}
                sx={{
                  display: 'flex',
                  gap: 1,
                  height: 150,
                  alignItems: 'flex-end',
                  borderBottom: `1px solid ${tokens.border.strong}`,
                }}
              >
                {data.dailyRequests.map((day) => {
                  const isPeak = day.count === peak;
                  return (
                    <Stack
                      key={day.date}
                      sx={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: isPeak ? 700 : 400 }}
                        color={isPeak ? 'text.primary' : 'text.secondary'}
                      >
                        {day.count}
                      </Typography>
                      <Box
                        sx={{
                          height: `${(day.count / peak) * 110}px`,
                          minHeight: 2,
                          width: '64%',
                          maxWidth: 28,
                          bgcolor: isPeak ? tokens.blue[800] : '#b9c8e6',
                        }}
                      />
                    </Stack>
                  );
                })}
              </Box>
              <Stack direction="row" sx={{ gap: 1, mt: 0.5 }}>
                {data.dailyRequests.map((day) => (
                  <Typography
                    key={day.date}
                    variant="caption"
                    color="text.secondary"
                    sx={{ flex: 1, textAlign: 'center' }}
                  >
                    {day.date}
                  </Typography>
                ))}
              </Stack>
              <Typography
                component="figcaption"
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
              >
                Série histórica demonstrativa: {data.period}.
              </Typography>
            </Box>
          )}
        </Card>

        <Card title="Frota por status" subtitle={`${total} veículos`}>
          <Stack component="ul" spacing={1.75} sx={{ p: 0, m: 0, listStyle: 'none' }}>
            {kpis.map((kpi) => (
              <li key={kpi.label}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{kpi.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {kpi.value}
                  </Typography>
                </Stack>
                <Box aria-hidden sx={{ height: 6, bgcolor: tokens.surface.sunken }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${total ? (kpi.value / total) * 100 : 0}%`,
                      bgcolor: tokens.navy[800],
                    }}
                  />
                </Box>
              </li>
            ))}
          </Stack>
        </Card>
      </Box>

      <Card title="Rotas ativas" subtitle="Execução, ocupação e status">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <TextField
            select
            label="Filtrar por setor"
            size="small"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            sx={{ minWidth: 210 }}
          >
            <MenuItem value="all">Todos os setores</MenuItem>
            {[...new Set(data.routes.map((route) => route.sector))].map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Filtrar por período"
            size="small"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            sx={{ minWidth: 210 }}
          >
            <MenuItem value="all">Todo o período da referência</MenuItem>
            <MenuItem value="today">Hoje (data atual)</MenuItem>
          </TextField>
          {(sector !== 'all' || period !== 'all') && (
            <Button onClick={clearFilters}>Limpar filtros</Button>
          )}
        </Stack>
        <TableContainer
          tabIndex={0}
          role="region"
          aria-label="Rotas ativas: tabela com rolagem horizontal"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
        >
          <Table size="small" aria-label="Rotas ativas" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                {[
                  'Protocolo',
                  'Setor',
                  'Origem',
                  'Destino',
                  'Motorista',
                  'Veículo',
                  'Horário',
                  'Status',
                  'Ocupação',
                ].map((label) => (
                  <TableCell key={label} sx={{ py: 1.25 }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => {
                const full = route.occupied >= route.capacity;
                return (
                  <TableRow
                    key={route.id}
                    hover
                    sx={{ '&:last-child td': { borderBottom: 0 }, '& td': { py: 1.5 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{route.id}</TableCell>
                    <TableCell>{route.sector}</TableCell>
                    <TableCell>{route.origin}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.driver}</TableCell>
                    <TableCell>{route.vehicle}</TableCell>
                    <TableCell>{timeFormat.format(new Date(route.startsAt))}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label="Em execução"
                        sx={{ bgcolor: success.bg, color: success.fg }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {route.occupied}/{route.capacity}
                      {full && (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ ml: 1, color: warning.fg, fontWeight: 600 }}
                        >
                          Lotado
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {routes.length === 0 && (
          <EmptyState>
            {data.routes.length === 0
              ? 'Nenhuma rota ativa cadastrada.'
              : 'Nenhum resultado para os filtros selecionados.'}
          </EmptyState>
        )}
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
          alignItems: 'start',
        }}
      >
        <Card
          title="Abastecimento"
          subtitle="Últimos registros por veículo"
          action={
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              R$ / L
            </Typography>
          }
        >
          {data.refueling.length === 0 ? (
            <EmptyState>Nenhum abastecimento registrado.</EmptyState>
          ) : (
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {data.refueling.map((fuel, index) => (
                <Stack
                  key={fuel.id}
                  component="li"
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    gap: 2,
                    py: 1.25,
                    borderTop: index ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {fuel.vehicle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fuel.detail}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                    color={fuel.amount === null ? 'text.disabled' : 'text.primary'}
                  >
                    {fuel.amount === null ? '—' : currency.format(fuel.amount)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}
        </Card>

        <Card
          title="Alertas"
          subtitle={
            data.alerts.length > 0 ? `${data.alerts.length} pendência(s) em aberto` : undefined
          }
          action={
            data.alerts.length > 0 && (
              <Button
                size="small"
                onClick={() =>
                  onDetail({
                    title: 'Alertas da frota — demonstração',
                    description: data.alerts
                      .map((alert) => `${alert.title}: ${alert.detail}. ${alert.description}`)
                      .join('\n\n'),
                  })
                }
              >
                Abrir detalhes
              </Button>
            )
          }
        >
          {data.alerts.length === 0 ? (
            <EmptyState>Nenhum alerta registrado.</EmptyState>
          ) : (
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {data.alerts.map((alert, index) => (
                <Stack
                  key={alert.id}
                  component="li"
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.25,
                    borderTop: index ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <WarningAmberRounded aria-hidden sx={{ color: warning.fg, fontSize: 20 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.detail}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    aria-label={`Abrir ${alert.title}`}
                    onClick={() =>
                      onDetail({
                        title: alert.title,
                        description: `${alert.detail}. ${alert.description}`,
                      })
                    }
                  >
                    Abrir
                  </Button>
                </Stack>
              ))}
            </Box>
          )}
        </Card>
      </Box>
    </>
  );
}

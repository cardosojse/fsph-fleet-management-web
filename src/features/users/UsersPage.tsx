import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import { tokens } from '@/app/theme';
import { AppLayout } from '@/shared/layout/AppLayout';

import { loadDemoDirectory } from './mocks/users';

const sections = ['Usuários', 'Perfis e permissões', 'Auditoria'];
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Fortaleza',
});

function Status({ success, audit = false }: { success: boolean; audit?: boolean }) {
  return (
    <Chip
      size="small"
      label={audit ? (success ? 'Sucesso' : 'Bloqueado') : success ? 'Ativo' : 'Inativo'}
      sx={{
        bgcolor: success ? tokens.status.success.bg : tokens.status.error.bg,
        color: success ? tokens.status.success.fg : tokens.status.error.fg,
      }}
    />
  );
}

function DataTable({
  columns,
  rows,
  label,
}: {
  columns: string[];
  rows: { id: string; cells: ReactNode[] }[];
  label: string;
}) {
  return (
    <TableContainer
      tabIndex={0}
      role="region"
      aria-label={`${label}: tabela com rolagem horizontal`}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
    >
      <Table size="small" aria-label={label} sx={{ minWidth: 820 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} sx={{ py: 1.25 }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{ '&:last-child > *': { borderBottom: 0 }, '& > *': { py: 1.5 } }}
            >
              {row.cells.map((cell, index) => (
                <TableCell
                  key={columns[index]}
                  component={index === 0 ? 'th' : 'td'}
                  scope={index === 0 ? 'row' : undefined}
                  sx={index === 0 ? { fontWeight: 600 } : undefined}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function UsersPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sector, setSector] = useState('');
  const [status, setStatus] = useState('');
  const directory = useQuery({
    queryKey: ['users', 'demo-directory'],
    queryFn: loadDemoDirectory,
    retry: false,
  });
  const users = directory.data?.users ?? [];
  const normalized = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  const filtered = users.filter(
    (user) =>
      normalized(`${user.name} ${user.email}`).includes(normalized(search.trim())) &&
      (!role || user.role === role) &&
      (!sector || user.sector === sector) &&
      (!status || (user.active ? 'active' : 'inactive') === status),
  );
  const clearFilters = () => {
    setSearch('');
    setRole('');
    setSector('');
    setStatus('');
  };
  const count =
    tab === 0
      ? filtered.length
      : tab === 1
        ? (directory.data?.profiles.length ?? 0)
        : (directory.data?.audit.length ?? 0);

  return (
    <AppLayout
      active="usuarios"
      title="Usuários"
      subtitle="Contas, perfis de acesso e histórico por categoria"
      breadcrumbs={[{ label: 'SVO', to: '/' }, { label: 'Administração' }, { label: 'Usuários' }]}
    >
      <Stack spacing={2.5}>
        <Alert severity="info">
          Modo demonstrativo: dados fictícios, sem integração com a API. Perfis e eventos são
          exemplos; nenhuma permissão real é concedida.
        </Alert>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Categorias de usuários"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {sections.map((section, index) => (
            <Tab
              key={section}
              label={section}
              id={`users-tab-${index}`}
              aria-controls={`users-panel-${index}`}
            />
          ))}
        </Tabs>
        <Paper
          variant="outlined"
          role="tabpanel"
          id={`users-panel-${tab}`}
          aria-labelledby={`users-tab-${tab}`}
          sx={{ p: { xs: 2, md: 2.5 }, minWidth: 0 }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
            }}
          >
            <Box>
              <Typography component="h2" variant="h3">
                {sections[tab]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab === 0
                  ? 'Contas vinculadas por setor, perfil e status de acesso'
                  : tab === 1
                    ? 'Perfis ilustrativos compatíveis com o cadastro atual'
                    : 'Histórico fictício de ações com autor, data e hora'}
              </Typography>
            </Box>
            {directory.isSuccess && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {`${count} ${tab === 0 ? 'usuários' : tab === 1 ? 'perfis' : 'eventos'}`}
              </Typography>
            )}
          </Stack>
          {directory.isPending ? (
            <Stack role="status" direction="row" spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} />
              <Typography>Carregando categorias…</Typography>
            </Stack>
          ) : directory.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => void directory.refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível carregar os dados demonstrativos.
            </Alert>
          ) : (
            <>
              {tab === 0 && (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        xl: '2fr 1fr 1fr 1fr',
                      },
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <TextField
                      label="Buscar por nome ou e-mail"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      size="small"
                    />
                    <TextField
                      select
                      label="Perfil"
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Todos os perfis</MenuItem>
                      {[...new Set(users.map((user) => user.role))].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Setor"
                      value={sector}
                      onChange={(event) => setSector(event.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Todos os setores</MenuItem>
                      {[...new Set(users.map((user) => user.sector))].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Todos os status</MenuItem>
                      <MenuItem value="active">Ativo</MenuItem>
                      <MenuItem value="inactive">Inativo</MenuItem>
                    </TextField>
                  </Box>
                  {users.length === 0 ? (
                    <Alert severity="info">Nenhum usuário cadastrado nesta demonstração.</Alert>
                  ) : filtered.length === 0 ? (
                    <Alert
                      severity="info"
                      action={
                        <Button color="inherit" onClick={clearFilters}>
                          Limpar filtros
                        </Button>
                      }
                    >
                      Nenhum usuário encontrado para os filtros.
                    </Alert>
                  ) : (
                    <DataTable
                      label="Lista de usuários"
                      columns={[
                        'Nome completo',
                        'E-mail',
                        'Perfil de acesso',
                        'Setor',
                        'Último acesso',
                        'Status',
                      ]}
                      rows={filtered.map((user) => ({
                        id: user.id,
                        cells: [
                          user.name,
                          user.email,
                          user.role,
                          user.sector,
                          dateFormat.format(new Date(user.lastAccess)),
                          <Status key="status" success={user.active} />,
                        ],
                      }))}
                    />
                  )}
                  {!!(search || role || sector || status) && filtered.length > 0 && (
                    <Button onClick={clearFilters} sx={{ mt: 1 }}>
                      Limpar filtros
                    </Button>
                  )}
                </>
              )}
              {tab === 1 &&
                (directory.data.profiles.length === 0 ? (
                  <Alert severity="info">Nenhum perfil disponível.</Alert>
                ) : (
                  <DataTable
                    label="Perfis e permissões"
                    columns={['Perfil', 'Setor', 'Permissões ilustrativas']}
                    rows={directory.data.profiles.map((profile) => ({
                      id: profile.name,
                      cells: [profile.name, profile.sector, profile.description],
                    }))}
                  />
                ))}
              {tab === 2 &&
                (directory.data.audit.length === 0 ? (
                  <Alert severity="info">Nenhum evento de auditoria disponível.</Alert>
                ) : (
                  <DataTable
                    label="Auditoria"
                    columns={['Autor', 'Data / Hora', 'Ação', 'Status', 'Justificativa']}
                    rows={directory.data.audit.map((event) => ({
                      id: event.id,
                      cells: [
                        event.author,
                        dateFormat.format(new Date(event.date)),
                        event.action,
                        <Status key="status" success={event.success} audit />,
                        event.detail,
                      ],
                    }))}
                  />
                ))}
            </>
          )}
        </Paper>
      </Stack>
    </AppLayout>
  );
}

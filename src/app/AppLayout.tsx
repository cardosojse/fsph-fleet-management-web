import { useState } from 'react';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { authApi } from '@/features/auth/api';
import { useSession } from '@/features/auth/useSession';
import { authToken } from '@/shared/api/auth-token';
import { roleLabels } from '@/shared/api/types';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';

const navigation = [
  ['/', 'Início'],
  ['/setores', 'Setores'],
  ['/usuarios', 'Usuários'],
  ['/veiculos', 'Veículos'],
  ['/motoristas', 'Motoristas'],
  ['/transportes', 'Transportes'],
  ['/viagens', 'Viagens'],
  ['/permissoes', 'Permissões'],
] as const;

export function AppLayout() {
  const session = useSession();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<unknown>(null);
  if (!session.token)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (session.isPending) return <Loading />;
  if (session.error)
    return (
      <Container sx={{ py: 6 }}>
        <ApiFeedback
          error={session.error}
          retry={() => {
            void session.refetch();
          }}
        />
        <Button
          onClick={() => {
            authToken.clear();
            queryClient.clear();
          }}
        >
          Voltar ao login
        </Button>
      </Container>
    );
  if (!session.data) return null;
  const logout = async () => {
    setSigningOut(true);
    setLogoutError(null);
    try {
      await authApi.logout();
      await queryClient.cancelQueries();
      authToken.clear();
      queryClient.clear();
    } catch (error) {
      setLogoutError(error);
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, flexGrow: 1 }}
          >
            FSPH · Gestão de Frotas
          </Typography>
          <Typography variant="body2">
            {session.data.name} · {roleLabels[session.data.role]}
          </Typography>
          <Button component={Link} to="/conta" color="inherit">
            Minha conta
          </Button>
          <Button
            color="inherit"
            disabled={signingOut}
            onClick={() => {
              void logout();
            }}
          >
            {signingOut ? 'Saindo…' : 'Sair'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
        }}
      >
        <Stack direction="row" sx={{ px: { xs: 1, md: 3 }, width: 'max-content' }}>
          {navigation.map(([to, label]) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              end={to === '/'}
              sx={{
                py: 2,
                px: 2,
                whiteSpace: 'nowrap',
                borderRadius: 0,
                '&.active': { bgcolor: 'action.selected', boxShadow: 'inset 0 -3px #0b4f6c' },
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Box>
      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <ApiFeedback error={logoutError} />
          <Outlet />
        </Stack>
      </Container>
    </>
  );
}

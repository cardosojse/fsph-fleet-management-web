import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '@/features/auth/api';
import { useSession } from '@/features/auth/useSession';
import { authToken } from '@/shared/api/auth-token';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { ReportsPage } from './ReportsPage';

export function ReportsRoute() {
  const session = useSession();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [logoutError, setLogoutError] = useState<unknown>();
  if (!session.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (session.isPending) return <Loading />;
  if (!session.data)
    return <ApiFeedback error={session.error} retry={() => void session.refetch()} />;

  const { role, permissions } = session.data;
  const fleet =
    role !== 'MOTORISTA' &&
    permissions.includes('VEHICLES_READ') &&
    permissions.includes('TRIPS_READ');
  const allowed =
    fleet ||
    ['TRIP_REQUESTS_READ', 'FUELINGS_READ', 'MAINTENANCES_READ'].some((permission) =>
      permissions.includes(permission),
    );
  if (!allowed)
    return (
      <Box role="alert" sx={{ p: 3 }}>
        Seu perfil n?o tem acesso a Relat?rios.
      </Box>
    );

  async function logout() {
    try {
      await authApi.logout();
      authToken.clear();
      queryClient.clear();
    } catch (error) {
      setLogoutError(error);
    }
  }

  return (
    <Box className="app-layout">
      <AppBar className="app-layout-chrome" position="static" color="default" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Button component={Link} to="/">
            In?cio
          </Button>
          <Box sx={{ flex: 1 }}>{session.data.name}</Box>
          <Button onClick={() => void logout()}>Sair</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" id="app-content" maxWidth="xl" sx={{ py: 3 }}>
        <ApiFeedback error={logoutError} />
        <ReportsPage />
      </Container>
    </Box>
  );
}

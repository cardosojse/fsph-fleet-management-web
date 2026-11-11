import { useState } from 'react';
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authToken } from '@/shared/api/auth-token';
import type { Dto } from '@/shared/api/types';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { env } from '@/shared/config/env';
import { authApi } from './api';
import { useSession } from './useSession';

export function LoginPage() {
  const [error, setError] = useState<unknown>(null);
  const queryClient = useQueryClient();
  const session = useSession();
  const location = useLocation();
  const from: unknown = location.state?.from;
  const destination =
    typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && from !== '/login'
      ? from
      : '/';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dto['LoginRequest']>({
    defaultValues: { email: env.isStaging ? 'demo@frota.test' : '', password: '' },
  });
  if (session.token && session.isPending) return <Loading />;
  if (session.data && session.token) return <Navigate to={destination} replace />;
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await authApi.login(values);
      queryClient.clear();
      authToken.set(response.accessToken);
    } catch (failure) {
      setError(failure);
    }
  });
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={3}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              FSPH · Acesso ao sistema
            </Typography>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700 }}>
              Gestão de Frotas
            </Typography>
            <Typography color="text.secondary">
              {env.isStaging
                ? 'Homologação: use o e-mail de demonstração e a senha fornecida pela equipe.'
                : 'Entre com seu e-mail e senha para continuar.'}
            </Typography>
            <ApiFeedback
              error={error ?? (session.token ? session.error : null)}
              retry={
                session.token
                  ? () => {
                      void session.refetch();
                    }
                  : undefined
              }
            />
            <Stack component="form" spacing={2.5} onSubmit={submit}>
              <TextField
                label="E-mail"
                type="email"
                autoComplete="username"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email', { required: 'Informe seu e-mail.' })}
              />
              <TextField
                label="Senha"
                type="password"
                autoComplete="current-password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password', { required: 'Informe sua senha.' })}
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

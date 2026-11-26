import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, CircularProgress, InputAdornment, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { z } from 'zod';

import { PublicLayout } from '@/shared/layout/PublicLayout';

import { demoCredentials, simulateLogin } from './mocks/login';

const schema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('Informe um e-mail válido.').max(254, 'Use até 254 caracteres.')),
  password: z.string().min(1, 'Informe sua senha.'),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useMutation({ mutationFn: simulateLogin, retry: false });
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const busy = login.isPending;
  const submit = handleSubmit((values) => {
    if (busy) return;
    login.mutate(values, {
      onSuccess: () => {
        resetField('password');
        setShowPassword(false);
      },
    });
  });

  return (
    <PublicLayout
      title="Entrar no sistema"
      description="Use sua conta institucional. Seu perfil e setor são definidos pela conta, sem seleção no login."
    >
      <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
        Modo demonstrativo: use {demoCredentials.email} e a senha {demoCredentials.password}. A API
        de login ainda não está integrada. A simulação não inicia uma sessão autenticada.
      </Alert>
      {login.isSuccess ? (
        <Stack spacing={2}>
          <Alert severity="success" role="status">
            Simulação concluída. Nenhuma sessão autenticada foi criada.
          </Alert>
          <Button component={RouterLink} to="/dashboard/demo" variant="contained" size="large">
            Abrir dashboard demonstrativo
          </Button>
          <Button variant="outlined" onClick={() => login.reset()}>
            Voltar ao login
          </Button>
        </Stack>
      ) : (
        <Stack component="form" noValidate onSubmit={submit} spacing={2.5} aria-busy={busy}>
          {login.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" disabled={busy} onClick={() => void submit()}>
                  Tentar novamente
                </Button>
              }
            >
              {login.error.message}
            </Alert>
          )}
          <TextField
            label="E-mail institucional"
            placeholder="nome@orgao.gov.br"
            type="email"
            autoComplete="username"
            required
            fullWidth
            disabled={busy}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Senha"
            placeholder="Informe sua senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            fullWidth
            disabled={busy}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-pressed={showPassword}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Verificando…
              </>
            ) : (
              'Entrar'
            )}
          </Button>
          <Button
            component={RouterLink}
            to="/recuperar-senha"
            disabled={busy}
            sx={{ alignSelf: 'center' }}
          >
            Esqueci minha senha
          </Button>
        </Stack>
      )}
    </PublicLayout>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { PublicLayout } from '@/shared/layout/PublicLayout';

import {
  demoResetToken,
  loadDemoResetContext,
  simulatePasswordReset,
} from './mocks/password-reset';

const schema = z.object({
  password: z.string().min(8, 'Use pelo menos 8 caracteres.').max(128, 'Use até 128 caracteres.'),
});
type Values = z.infer<typeof schema>;

export function PasswordResetPage() {
  const [params] = useSearchParams();
  // Real recovery links cannot be validated until the API contract is available.
  const demo = params.get('token') === demoResetToken;
  return (
    <PublicLayout
      title="Alterar senha"
      description="Defina uma nova senha para acessar o sistema."
      after={
        <Button component={RouterLink} to="/login">
          Voltar ao login
        </Button>
      }
    >
      <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
        Modo demonstrativo: a API de alteração de senha ainda não está integrada. Nenhuma senha será
        enviada, armazenada ou alterada. Links reais de recuperação não são validados nesta
        demonstração.
      </Alert>
      {demo ? (
        <DemoPasswordReset />
      ) : (
        <Stack spacing={2}>
          <Alert severity="warning">
            Link ausente ou indisponível para esta demonstração. Inicie a recuperação simulada para
            abrir um link demonstrativo. A validade de links reais depende da API.
          </Alert>
          <Button component={RouterLink} to="/recuperar-senha" variant="contained">
            Solicitar recuperação de senha
          </Button>
        </Stack>
      )}
    </PublicLayout>
  );
}

function DemoPasswordReset() {
  const [visible, setVisible] = useState(false);
  const context = useQuery({
    queryKey: ['password-reset', 'demo-context'],
    queryFn: loadDemoResetContext,
    retry: false,
    staleTime: 0,
  });
  const resetPassword = useMutation({ mutationFn: simulatePasswordReset, retry: false });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });
  const busy = resetPassword.isPending;
  const submit = handleSubmit(() => {
    if (busy || context.isFetching || !context.data?.valid || context.isError) return;
    // Password is validated only in the form; the mock never receives it.
    resetPassword.mutate(undefined, {
      onSuccess: () => {
        reset();
        setVisible(false);
      },
    });
  });

  if (context.isPending)
    return (
      <Stack role="status" spacing={2} sx={{ alignItems: 'center', py: 3 }}>
        <CircularProgress />
        <Typography>Carregando link demonstrativo…</Typography>
      </Stack>
    );
  if (context.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => void context.refetch()}>
            Tentar novamente
          </Button>
        }
      >
        Não foi possível carregar o link demonstrativo.
      </Alert>
    );
  if (!context.data.valid)
    return (
      <Stack spacing={2}>
        <Alert severity="warning">Link demonstrativo inválido ou expirado.</Alert>
        <Button component={RouterLink} to="/recuperar-senha">
          Solicitar novo link
        </Button>
      </Stack>
    );
  if (resetPassword.isSuccess)
    return (
      <Stack spacing={2}>
        <Alert severity="success" role="status">
          Simulação concluída. Sua senha real não foi alterada. Use suas credenciais existentes para
          entrar.
        </Alert>
        <Button component={RouterLink} to="/login" variant="contained">
          Ir para o login
        </Button>
      </Stack>
    );

  return (
    <Stack component="form" noValidate onSubmit={submit} spacing={2.5} aria-busy={busy}>
      {resetPassword.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" disabled={busy} onClick={() => void submit()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível simular a alteração. Tente novamente.
        </Alert>
      )}
      <TextField
        label="Nova Senha"
        placeholder="Informe sua nova senha"
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        required
        fullWidth
        disabled={busy || context.isFetching}
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message ?? 'Use de 8 a 128 caracteres, conforme o cadastro.'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  disabled={busy}
                  aria-pressed={visible}
                  onClick={() => setVisible((value) => !value)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {visible ? 'Ocultar senha' : 'Mostrar senha'}
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />
      <Button type="submit" variant="contained" size="large" disabled={busy || context.isFetching}>
        {busy ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Simulando alteração…
          </>
        ) : (
          'Alterar'
        )}
      </Button>
    </Stack>
  );
}

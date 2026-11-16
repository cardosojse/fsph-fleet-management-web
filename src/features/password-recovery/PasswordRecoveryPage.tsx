import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { z } from 'zod';

import { simulatePasswordRecovery } from './mocks/password-recovery';
import { demoResetPath } from '@/features/password-reset/mocks/password-reset';
import { PublicLayout } from '@/shared/layout/PublicLayout';

const schema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('Informe um e-mail válido.').max(254, 'Use até 254 caracteres.')),
});

type Values = z.infer<typeof schema>;

export function PasswordRecoveryPage() {
  const recovery = useMutation({ mutationFn: simulatePasswordRecovery, retry: false });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  const busy = recovery.isPending;
  const submit = handleSubmit(() => recovery.mutate());

  return (
    <PublicLayout
      title="Recuperar senha"
      description="Informe seu e-mail institucional para solicitar a recuperação da sua senha."
      after={
        <Button component={RouterLink} to="/">
          Voltar ao início
        </Button>
      }
    >
      <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
        Modo demonstrativo: o envio é simulado. Nenhum e-mail será enviado, nenhum dado será
        armazenado e sua senha não será alterada.
      </Alert>
      {recovery.isSuccess ? (
        <Stack spacing={2}>
          <Alert severity="success" role="status">
            Simulação concluída. Em uma integração real, se houver uma conta vinculada ao e-mail
            informado, você receberá instruções para recuperar sua senha.
          </Alert>
          <Button variant="outlined" onClick={() => recovery.reset()}>
            Informar outro e-mail
          </Button>
          <Button component={RouterLink} to={demoResetPath} variant="contained">
            Continuar para alteração de senha (demonstração)
          </Button>
        </Stack>
      ) : (
        <Stack component="form" noValidate onSubmit={submit} spacing={2.5} aria-busy={busy}>
          {recovery.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" disabled={busy} onClick={() => void submit()}>
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível simular a solicitação. Seu e-mail foi mantido para tentar novamente.
            </Alert>
          )}
          <TextField
            label="E-mail institucional"
            placeholder="nome@orgao.gov.br"
            type="email"
            autoComplete="email"
            required
            fullWidth
            disabled={busy}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message ?? 'Use o e-mail associado à sua conta.'}
          />
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Simulando solicitação…
              </>
            ) : (
              'Solicitar recuperação (demonstração)'
            )}
          </Button>
        </Stack>
      )}
    </PublicLayout>
  );
}

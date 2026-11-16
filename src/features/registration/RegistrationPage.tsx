import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PublicLayout } from '@/shared/layout/PublicLayout';

import { loadDemoSectors, simulateRegistration } from './mocks/registration';

const schema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(150, 'Use até 150 caracteres.'),
  email: z.email('Informe um e-mail válido.').max(254, 'Use até 254 caracteres.'),
  password: z.string().min(8, 'Use pelo menos 8 caracteres.').max(128, 'Use até 128 caracteres.'),
  sector: z.string().min(1, 'Selecione um setor.'),
  role: z.enum(['ADMIN', 'COORDENADOR', 'MOTORISTA'], { error: 'Selecione um perfil.' }),
});
type Values = z.infer<typeof schema>;

export function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const sectors = useQuery({
    queryKey: ['registration', 'demo-sectors'],
    queryFn: loadDemoSectors,
    retry: false,
  });
  const registration = useMutation({ mutationFn: simulateRegistration });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', sector: '' },
  });
  const busy = registration.isPending;

  const submit = handleSubmit(async () => {
    setSuccess(false);
    try {
      await registration.mutateAsync();
      reset();
      setShowPassword(false);
      setSuccess(true);
    } catch {
      // The mutation error is presented below; field values remain available for retry.
    }
  });

  return (
    <PublicLayout
      title="Cadastro de usuário"
      description="Preencha seus dados para solicitar acesso ao sistema."
      width={560}
      after={
        <Button component={RouterLink} to="/login">
          Já tenho conta — entrar
        </Button>
      }
    >
      <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
        Modo demonstrativo: setores fictícios. O envio simula o cadastro; nenhuma conta é criada e
        os dados não são armazenados. Os perfis não concedem permissões reais.
      </Alert>
      <Stack component="form" noValidate onSubmit={submit} spacing={2.5}>
        {success && (
          <Alert severity="success" role="status">
            Simulação concluída. Nenhuma conta real foi criada.
          </Alert>
        )}
        {registration.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void submit()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível simular o cadastro. Tente novamente.
          </Alert>
        )}
        <TextField
          label="Nome"
          placeholder="Nome completo"
          autoComplete="name"
          required
          fullWidth
          disabled={busy}
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
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
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          placeholder="Informe sua senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          fullWidth
          disabled={busy}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message ?? 'Use pelo menos 8 caracteres.'}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    disabled={busy}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
        {sectors.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void sectors.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar os setores.
          </Alert>
        ) : (
          <>
            {sectors.isSuccess && sectors.data.length === 0 && (
              <Alert severity="warning">
                Nenhum setor cadastrado. O cadastro estará disponível quando houver setores.
              </Alert>
            )}
            <Controller
              name="sector"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={sectors.data ?? []}
                  getOptionLabel={(option) => option.name}
                  value={sectors.data?.find((sector) => sector.id === field.value) ?? null}
                  onChange={(_, value) => field.onChange(value?.id ?? '')}
                  onBlur={field.onBlur}
                  disabled={busy || sectors.isPending || !sectors.data?.length}
                  loading={sectors.isPending}
                  noOptionsText="Nenhum setor encontrado para a busca."
                  loadingText="Carregando setores…"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      label="Setor"
                      required
                      placeholder={
                        sectors.isPending ? 'Carregando setores…' : 'Selecione ou busque o setor'
                      }
                      error={!!errors.sector}
                      helperText={errors.sector?.message}
                    />
                  )}
                />
              )}
            />
          </>
        )}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              select
              label="Perfil"
              required
              fullWidth
              disabled={busy}
              error={!!errors.role}
              helperText={errors.role?.message}
            >
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="COORDENADOR">Coordenador</MenuItem>
              <MenuItem value="MOTORISTA">Motorista</MenuItem>
            </TextField>
          )}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={busy || !sectors.data?.length || sectors.isError}
        >
          {busy ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Simulando cadastro…
            </>
          ) : (
            'Cadastrar (demonstração)'
          )}
        </Button>
      </Stack>
    </PublicLayout>
  );
}

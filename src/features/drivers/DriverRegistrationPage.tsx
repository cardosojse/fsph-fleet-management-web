import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFleetData } from '@/features/home/fleet-data';
import {
  createDemoDriver,
  emptyDriverFields,
  licenseCategories,
  localDate,
  validateDriver,
  type DriverFields,
} from './driver-validation';

const sections: {
  id: string;
  title: string;
  fields: {
    key: keyof DriverFields;
    label: string;
    type?: string;
    options?: string[];
    optional?: boolean;
  }[];
}[] = [
  {
    id: 'personal',
    title: 'Dados pessoais',
    fields: [
      { key: 'name', label: 'Nome completo' },
      { key: 'cpf', label: 'CPF' },
      { key: 'phone', label: 'Telefone', type: 'tel' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'sector', label: 'Setor' },
    ],
  },
  {
    id: 'license',
    title: 'CNH e conta',
    fields: [
      { key: 'license', label: 'Número da CNH' },
      { key: 'licenseCategory', label: 'Categoria da CNH', options: licenseCategories },
      { key: 'licenseExpiry', label: 'Validade da CNH', type: 'date' },
      { key: 'document', label: 'Documento', options: ['CNH'] },
      { key: 'linkedAccount', label: 'Conta vinculada', optional: true },
      { key: 'profile', label: 'Perfil', options: ['Motorista'] },
    ],
  },
  {
    id: 'shift',
    title: 'Equipe e plantão',
    fields: [
      { key: 'team', label: 'Equipe', optional: true },
      { key: 'date', label: 'Data', type: 'date', optional: true },
      { key: 'start', label: 'Horário de início', type: 'time', optional: true },
      { key: 'end', label: 'Horário de fim', type: 'time', optional: true },
      { key: 'availability', label: 'Disponibilidade', options: ['Disponível', 'Indisponível'] },
      { key: 'vehicleId', label: 'Veículo', options: [], optional: true },
    ],
  },
];

export function DriverRegistrationPage() {
  const { drivers, vehicles, setDrivers } = useFleetData();
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const today = localDate();
  const resolver: Resolver<DriverFields> = (values) => {
    const messages = validateDriver(values, drivers, vehicles, today);
    return Object.keys(messages).length
      ? {
          values: {},
          errors: Object.fromEntries(
            Object.entries(messages).map(([key, message]) => [key, { type: 'validate', message }]),
          ),
        }
      : { values, errors: {} };
  };
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<DriverFields>({
    defaultValues: emptyDriverFields,
    resolver,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const values = useWatch({ control }) as DriverFields;
  const preview = validateDriver(values, drivers, vehicles, today);
  const hasShift = Boolean(
    values.team || values.date || values.start || values.end || values.vehicleId,
  );
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function save(data: DriverFields) {
    const driver = createDemoDriver(data, drivers);
    setDrivers((current) => [...current, driver]);
    navigate('/motoristas', { replace: true, state: { driverCreated: driver.name } });
  }

  return (
    <Box component="main" id="main-content" sx={{ pb: 4 }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid #d0d5dd',
          px: { xs: 2, md: 3 },
          py: 3,
        }}
      >
        <Breadcrumbs sx={{ mb: 1, fontSize: 14 }} aria-label="Caminho da página">
          <Link component={RouterLink} to="/motoristas" underline="hover">
            FSPH
          </Link>
          <Link component={RouterLink} to="/motoristas" underline="hover">
            Motoristas
          </Link>
          <Typography variant="body2" color="text.primary">
            Novo motorista
          </Typography>
        </Breadcrumbs>
        <Typography
          component="h1"
          variant="h1"
          ref={titleRef}
          tabIndex={-1}
          sx={{ fontSize: '1.9rem', mb: 0.5 }}
        >
          Novo motorista
        </Typography>
        <Typography color="text.secondary" variant="body2">
          FSPH • Frota administrativa • Cadastro demonstrativo
        </Typography>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 2.5 }}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(save)}
          aria-label="Cadastro de motorista"
        >
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1fr) minmax(280px, 0.85fr)',
              },
              gap: 3,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                component="nav"
                aria-label="Seções do cadastro"
                direction="row"
                spacing={1}
                sx={{ borderBottom: '1px solid #e5e7eb', mb: 2, flexWrap: 'wrap' }}
              >
                {sections.map((section, index) => (
                  <Button
                    key={section.id}
                    component="a"
                    href={`#${section.id}`}
                    size="small"
                    sx={{
                      px: 0.5,
                      py: 1,
                      borderRadius: 0,
                      borderBottom: index === 0 ? '2px solid #2563eb' : undefined,
                      color: index === 0 ? '#2563eb' : 'text.secondary',
                    }}
                  >
                    {index === 0 ? 'Dados' : section.title}
                  </Button>
                ))}
              </Stack>
              <Stack spacing={2.5}>
                {sections.map((section) => (
                  <Box
                    component="section"
                    id={section.id}
                    key={section.id}
                    aria-labelledby={`${section.id}-title`}
                    sx={{ scrollMarginTop: 16 }}
                  >
                    <Typography
                      component="h2"
                      id={`${section.id}-title`}
                      variant="subtitle1"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      {section.title}
                    </Typography>
                    {section.id === 'shift' && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="p"
                        sx={{ mb: 2 }}
                      >
                        Plantão opcional. Ao informar equipe, data, horário ou veículo, preencha
                        equipe, data, início e fim. Horários no mesmo dia.
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          sm: 'repeat(2, minmax(0, 1fr))',
                          md: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: 2,
                      }}
                    >
                      {section.fields.map(({ key, label, type, options, optional }) => {
                        const error = errors[key];
                        return (
                          <Controller
                            key={key}
                            name={key}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                              <Box>
                                <Typography
                                  component="label"
                                  htmlFor={`driver-${key}`}
                                  id={`driver-${key}-label`}
                                  variant="body2"
                                  sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
                                >
                                  {label}
                                  {!optional && ' *'}
                                </Typography>
                                <TextField
                                  {...field}
                                  inputRef={ref}
                                  id={`driver-${key}`}
                                  fullWidth
                                  size="small"
                                  type={type}
                                  select={Boolean(options)}
                                  value={field.value}
                                  required={!optional}
                                  error={Boolean(error)}
                                  helperText={
                                    error?.message ||
                                    (key === 'linkedAccount'
                                      ? 'Referência local, sem vínculo real.'
                                      : key === 'team'
                                        ? 'Equipe demonstrativa.'
                                        : undefined)
                                  }
                                  slotProps={{
                                    select: { labelId: `driver-${key}-label`, displayEmpty: true },
                                    htmlInput: {
                                      'aria-label': label,
                                      ...(key === 'cpf' || key === 'license'
                                        ? { inputMode: 'numeric' }
                                        : {}),
                                      ...(key === 'licenseExpiry' ? { min: today } : {}),
                                    },
                                  }}
                                  sx={{
                                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: 'white' },
                                  }}
                                >
                                  {options && [
                                    <MenuItem value="" key="empty">
                                      {optional ? 'Não informado' : 'Selecione'}
                                    </MenuItem>,
                                    ...(key === 'vehicleId'
                                      ? vehicles.map((vehicle) => (
                                          <MenuItem key={vehicle.id} value={String(vehicle.id)}>
                                            {vehicle.plate} · {vehicle.model}
                                          </MenuItem>
                                        ))
                                      : options.map((option) => (
                                          <MenuItem key={option} value={option}>
                                            {option}
                                          </MenuItem>
                                        ))),
                                  ]}
                                </TextField>
                              </Box>
                            )}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Stack
              component="aside"
              aria-label="Validações do cadastro"
              spacing={2}
              sx={{ minWidth: 0 }}
            >
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fb' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Validade da CNH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {values.licenseExpiry
                    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
                        new Date(`${values.licenseExpiry}T12:00:00Z`),
                      )
                    : 'Informe a data de validade.'}
                </Typography>
              </Paper>
              <Alert
                severity={
                  !values.licenseExpiry ? 'info' : preview.licenseExpiry ? 'error' : 'success'
                }
              >
                {!values.licenseExpiry
                  ? 'A CNH será verificada pela data informada.'
                  : preview.licenseExpiry || 'CNH válida na data atual.'}
              </Alert>
              <Alert severity={preview.vehicleId ? 'error' : 'info'}>
                {preview.vehicleId ||
                  (hasShift
                    ? values.vehicleId &&
                      values.date &&
                      values.start &&
                      values.end &&
                      !preview.start &&
                      !preview.end &&
                      !preview.date
                      ? 'Nenhum conflito de veículo encontrado nos plantões demonstrativos.'
                      : 'Preencha veículo, data e horários válidos para verificar conflitos.'
                    : 'Sem plantão definido. Você pode cadastrar o motorista sem escala.')}
              </Alert>
              <Box aria-live="polite" aria-atomic="true">
                {Object.keys(errors).length > 0 ? (
                  <Alert severity="error">
                    <Typography variant="subtitle2">Revise os dados informados</Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {sections
                        .flatMap(({ fields }) => fields)
                        .filter(({ key }) => errors[key])
                        .map(({ key, label }) => (
                          <li key={key}>
                            <Link
                              href={`#driver-${key}`}
                              onClick={(event) => {
                                event.preventDefault();
                                document.getElementById(`driver-${key}`)?.focus();
                              }}
                            >
                              {label}: {errors[key]?.message}
                            </Link>
                          </li>
                        ))}
                    </Box>
                  </Alert>
                ) : (
                  <Alert severity={Object.keys(preview).length === 0 ? 'success' : 'info'}>
                    {Object.keys(preview).length === 0
                      ? 'Cadastro válido. Pronto para salvar nesta sessão.'
                      : submitCount > 0
                        ? 'Continue preenchendo os campos obrigatórios.'
                        : 'Preencha os campos obrigatórios para validar o cadastro.'}
                  </Alert>
                )}
              </Box>
              <Alert severity="info" sx={{ mt: 1 }}>
                Simulação local: contas, equipes e plantões não possuem integração real. Conflitos
                são verificados apenas com os dados desta sessão. Recarregar a página restaura os
                dados iniciais.
              </Alert>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 2 }}>
            <Button component={RouterLink} to="/motoristas" variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Cadastrar motorista
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

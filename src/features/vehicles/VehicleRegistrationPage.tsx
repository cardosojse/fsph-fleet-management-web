import { useEffect, useRef, useState } from 'react';
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
  cardBalance,
  compatibleFuel,
  createDemoVehicle,
  emptyVehicleFields,
  formatMoney,
  fuelOptions,
  validateVehicle,
  vehicleCategories,
  vehicleShiftNotice,
  vehicleStatuses,
  vehicleToday,
  type VehicleFields,
} from './vehicle-validation';

type FormField = {
  key: keyof VehicleFields;
  label: string;
  type?: string;
  options?: readonly string[];
  optional?: boolean;
  multiline?: boolean;
  helper?: string;
  placeholder?: string;
};
const sections: { id: string; title: string; fields: FormField[] }[] = [
  {
    id: 'identificacao',
    title: 'Identificação',
    fields: [
      { key: 'plate', label: 'Placa', placeholder: 'ABC1D23 ou ABC-1234' },
      { key: 'model', label: 'Modelo / Marca', placeholder: 'Ex.: Renault Master' },
      { key: 'year', label: 'Ano', type: 'number', placeholder: 'Ex.: 2023' },
      { key: 'sector', label: 'Setor', placeholder: 'Ex.: Administrativo' },
      { key: 'fuel', label: 'Combustível', options: fuelOptions },
      {
        key: 'status',
        label: 'Status de disponibilidade',
        options: vehicleStatuses,
        helper: 'Ativo, em manutenção ou inativo.',
      },
      { key: 'category', label: 'Categoria', options: vehicleCategories },
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos',
    fields: [
      { key: 'crlvExpiry', label: 'CRLV vigente até', type: 'date' },
      { key: 'insuranceExpiry', label: 'Seguro vigente até', type: 'date' },
      {
        key: 'documentReferences',
        label: 'Documentos anexos',
        optional: true,
        multiline: true,
        placeholder: 'Ex.: CRLV e seguro',
        helper: 'Referências demonstrativas. Nenhum arquivo será enviado.',
      },
      { key: 'notes', label: 'Observações', optional: true, multiline: true },
    ],
  },
  {
    id: 'operacao',
    title: 'Operação',
    fields: [
      {
        key: 'capacity',
        label: 'Capacidade máxima',
        type: 'number',
        helper: 'Quantidade de ocupantes, incluindo motorista.',
      },
      {
        key: 'mileage',
        label: 'Quilometragem atual',
        type: 'number',
        helper: 'Quilômetros inteiros.',
      },
      { key: 'occupancy', label: 'Ocupação atual', type: 'number' },
      {
        key: 'lastRefueling',
        label: 'Abastecimento (último)',
        optional: true,
        multiline: true,
        placeholder: 'Ex.: data, litros e valor',
        helper: 'Descrição demonstrativa, sem registro financeiro.',
      },
      {
        key: 'refuelingFuel',
        label: 'Combustível do abastecimento',
        optional: true,
        options: fuelOptions,
        helper: 'Opcional, para comparar com o combustível do veículo.',
      },
    ],
  },
  {
    id: 'carta',
    title: 'Carta',
    fields: [
      { key: 'cardLimit', label: 'Limite da carta', optional: true, placeholder: 'Ex.: 1.500,00' },
      { key: 'cardUsed', label: 'Valor usado', optional: true, placeholder: 'Ex.: 0,00' },
      { key: 'cardExpiry', label: 'Validade da carta', optional: true, type: 'date' },
      { key: 'cardNotes', label: 'Observações da carta', optional: true, multiline: true },
    ],
  },
];
const fields = sections.flatMap((section) => section.fields);
const rules: { label: string; keys: (keyof VehicleFields)[] }[] = [
  { label: 'Placa brasileira válida e não repetida na frota.', keys: ['plate'] },
  {
    label: 'Identificação e setor obrigatórios.',
    keys: ['model', 'year', 'sector', 'fuel', 'status', 'category'],
  },
  { label: 'Capacidade positiva e ocupação dentro do limite.', keys: ['capacity', 'occupancy'] },
  { label: 'Quilometragem não negativa.', keys: ['mileage'] },
  { label: 'CRLV e seguro dentro da validade.', keys: ['crlvExpiry', 'insuranceExpiry'] },
];
const examples = [
  'Indisponibilidade ou manutenção: em um fluxo de rotas, o veículo pode exigir restrição de uso.',
  'CRLV ou seguro vencidos: revise as datas informadas.',
  'Conflitos de utilização: exigem data e horários para comparação.',
  'Quilometragem regressiva: exige uma leitura anterior para comparação.',
  'Abastecimento incompatível: compare os combustíveis quando informados.',
  'Valor usado acima do limite da carta: revise os valores.',
  'Lotação excedida: a ocupação não pode superar a capacidade.',
];

export function VehicleRegistrationPage() {
  const { vehicles, drivers, setVehicles } = useFleetData();
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeSection, setActiveSection] = useState('identificacao');
  const today = vehicleToday();
  const resolver: Resolver<VehicleFields> = (values) => {
    const messages = validateVehicle(values, vehicles, today);
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
    formState: { errors, isSubmitting },
  } = useForm<VehicleFields>({
    defaultValues: emptyVehicleFields,
    resolver,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const values = useWatch({ control }) as VehicleFields;
  const preview = validateVehicle(values, vehicles, today);
  const balance = cardBalance(values);
  const fuelMatch = compatibleFuel(values.fuel, values.refuelingFuel);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function save(data: VehicleFields) {
    const vehicle = createDemoVehicle(data, vehicles);
    setVehicles((current) => [...current, vehicle]);
    navigate('/veiculos', { replace: true, state: { vehicleCreated: vehicle.plate } });
  }

  function focusField(key: keyof VehicleFields) {
    document.getElementById(`vehicle-${key}`)?.focus();
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
          <Link component={RouterLink} to="/veiculos" underline="hover">
            FSPH
          </Link>
          <Link component={RouterLink} to="/veiculos" underline="hover">
            Veículos
          </Link>
          <Typography variant="body2" color="text.primary">
            Novo veículo
          </Typography>
        </Breadcrumbs>
        <Typography
          component="h1"
          variant="h1"
          ref={titleRef}
          tabIndex={-1}
          sx={{ fontSize: '1.9rem', mb: 0.5 }}
        >
          Novo veículo
        </Typography>
        <Typography color="text.secondary" variant="body2">
          FSPH • Frota administrativa • Cadastro demonstrativo
        </Typography>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 2.5 }}>
        <Box
          component="form"
          noValidate
          aria-label="Cadastro de veículo"
          onSubmit={handleSubmit(save)}
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
                sx={{ flexWrap: 'wrap', gap: 0.5, mb: 2.5 }}
              >
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    component="a"
                    href={`#${section.id}`}
                    size="small"
                    aria-current={activeSection === section.id ? 'location' : undefined}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(`${section.id}-title`)?.focus();
                    }}
                    sx={{
                      borderRadius: 5,
                      px: 1.5,
                      bgcolor: activeSection === section.id ? '#edf4ff' : '#f8fafc',
                      color: activeSection === section.id ? '#2563eb' : 'text.secondary',
                    }}
                  >
                    {section.title}
                  </Button>
                ))}
              </Stack>
              <Stack spacing={2.5}>
                {sections.map((section) => (
                  <Box
                    component="section"
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-title`}
                    sx={{ scrollMarginTop: 16 }}
                  >
                    <Typography
                      component="h2"
                      tabIndex={-1}
                      id={`${section.id}-title`}
                      variant="subtitle1"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      {section.title}
                    </Typography>
                    {section.id === 'carta' && (
                      <Typography
                        variant="caption"
                        component="p"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        Opcional. Ao preencher a carta, informe limite, valor usado e validade.
                        Valores em reais.
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
                      {section.fields.map(
                        (
                          { key, label, type, options, optional, multiline, helper, placeholder },
                          index,
                        ) => (
                          <Controller
                            key={key}
                            name={key}
                            control={control}
                            render={({ field: { ref, ...field } }) => (
                              <Box
                                sx={{
                                  minWidth: 0,
                                  ...(key === 'cardExpiry'
                                    ? { gridColumn: { md: 1 }, gridRow: { md: 2 } }
                                    : key === 'cardNotes'
                                      ? { gridColumn: { md: '2 / span 2' }, gridRow: { md: 2 } }
                                      : {}),
                                }}
                              >
                                <Typography
                                  component="label"
                                  id={`vehicle-${key}-label`}
                                  htmlFor={`vehicle-${key}`}
                                  variant="body2"
                                  sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
                                >
                                  {label}
                                  {!optional && ' *'}
                                </Typography>
                                <TextField
                                  {...field}
                                  inputRef={ref}
                                  id={`vehicle-${key}`}
                                  fullWidth
                                  size="small"
                                  type={type}
                                  select={Boolean(options)}
                                  required={!optional}
                                  multiline={multiline}
                                  minRows={multiline ? 2 : undefined}
                                  placeholder={placeholder}
                                  error={Boolean(errors[key])}
                                  helperText={errors[key]?.message || helper}
                                  slotProps={{
                                    select: { labelId: `vehicle-${key}-label`, displayEmpty: true },
                                    htmlInput: {
                                      'aria-label': label,
                                      ...(type === 'number'
                                        ? {
                                            min: key === 'capacity' ? 1 : key === 'year' ? 1900 : 0,
                                            step: 1,
                                            ...(key === 'year'
                                              ? { max: Number(today.slice(0, 4)) + 1 }
                                              : {}),
                                          }
                                        : {}),
                                      ...(type === 'date' ? { min: today } : {}),
                                      ...(key === 'cardLimit' || key === 'cardUsed'
                                        ? { inputMode: 'decimal' }
                                        : {}),
                                      ...(key === 'plate' ? { autoCapitalize: 'characters' } : {}),
                                    },
                                  }}
                                  sx={{
                                    '& .MuiInputBase-root': { minHeight: 44, bgcolor: 'white' },
                                  }}
                                >
                                  {options && [
                                    key !== 'category' && (
                                      <MenuItem key="empty" value="">
                                        {optional ? 'Não informado' : 'Selecione'}
                                      </MenuItem>
                                    ),
                                    ...options.map((option) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    )),
                                  ]}
                                </TextField>
                                {section.id === 'carta' && index === 1 && (
                                  <Typography variant="caption" color="text.secondary">
                                    Saldo recalculado automaticamente.
                                  </Typography>
                                )}
                              </Box>
                            )}
                          />
                        ),
                      )}
                      {section.id === 'carta' && (
                        <Box sx={{ gridColumn: { md: 3 }, gridRow: { md: 1 } }}>
                          <Typography
                            component="label"
                            htmlFor="vehicle-cardBalance"
                            variant="body2"
                            sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
                          >
                            Saldo disponível
                          </Typography>
                          <TextField
                            id="vehicle-cardBalance"
                            fullWidth
                            size="small"
                            value={balance === null ? '—' : formatMoney(balance)}
                            slotProps={{
                              input: { readOnly: true },
                              htmlInput: { 'aria-label': 'Saldo disponível' },
                            }}
                            helperText="Calculado a partir do limite e valor usado."
                            sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: '#f8fafc' } }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Typography component="p" variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                * Campos obrigatórios. Dados mantidos somente em memória nesta sessão.
              </Typography>
            </Box>
            <Stack
              component="aside"
              aria-label="Painéis do cadastro"
              spacing={2}
              sx={{ minWidth: 0 }}
            >
              <Paper
                component="section"
                aria-labelledby="vehicle-validations-title"
                variant="outlined"
                sx={{ p: 2, bgcolor: '#f8f9fb' }}
              >
                <Typography
                  component="h2"
                  variant="subtitle2"
                  id="vehicle-validations-title"
                  sx={{ mb: 1.5 }}
                >
                  Validações obrigatórias
                </Typography>
                <Stack component="ul" spacing={1.5} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {rules.map(({ label, keys }) => {
                    const valid = keys.every((key) => values[key].trim() && !preview[key]);
                    const invalid = keys.some((key) => errors[key]);
                    return (
                      <Box
                        component="li"
                        key={label}
                        sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}
                      >
                        <Box
                          component="span"
                          aria-label={invalid ? 'Revisar' : valid ? 'Validado' : 'Pendente'}
                          sx={{
                            width: 18,
                            height: 5,
                            flexShrink: 0,
                            borderRadius: 2,
                            bgcolor: invalid ? '#d92d20' : valid ? '#149875' : '#98a2b3',
                          }}
                        />
                        <Typography variant="body2">{label}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Carta:{' '}
                  {balance === null
                    ? 'sem saldo calculado'
                    : `${formatMoney(balance)} de saldo disponível`}
                  .
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {!values.lastRefueling.trim() || fuelMatch === null
                    ? 'Abastecimento: dados insuficientes para confirmar compatibilidade.'
                    : fuelMatch
                      ? 'Combustíveis compatíveis na simulação.'
                      : 'Combustíveis incompatíveis na simulação.'}
                </Typography>
                <Box aria-live="polite" aria-atomic="true" sx={{ mt: 2 }}>
                  {Object.keys(errors).length > 0 ? (
                    <Alert severity="error">
                      <Typography variant="subtitle2">Revise os dados informados</Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {fields
                          .filter(({ key }) => errors[key])
                          .map(({ key, label }) => (
                            <li key={key}>
                              <Link
                                href={`#vehicle-${key}`}
                                onClick={(event) => {
                                  event.preventDefault();
                                  focusField(key);
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
                        : 'Preencha os campos obrigatórios para validar o cadastro.'}
                    </Alert>
                  )}
                </Box>
                <Typography variant="caption" component="p" color="text.secondary" sx={{ mt: 2 }}>
                  {vehicleShiftNotice(values.plate, vehicles, drivers)}
                </Typography>
              </Paper>
              <Paper
                component="section"
                aria-labelledby="vehicle-examples-title"
                variant="outlined"
                sx={{ p: 2, bgcolor: '#fff7d6', borderColor: '#f3df9b' }}
              >
                <Typography
                  component="h2"
                  variant="subtitle2"
                  id="vehicle-examples-title"
                  sx={{ mb: 1 }}
                >
                  Erros demonstrativos
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  Exemplos de mensagens. Não indicam erros neste cadastro e não impedem o
                  salvamento.
                </Typography>
                <Stack component="ul" spacing={1.5} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {examples.map((text) => (
                    <Box
                      component="li"
                      key={text}
                      sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}
                    >
                      <Box
                        component="span"
                        aria-hidden="true"
                        sx={{
                          width: 18,
                          height: 5,
                          flexShrink: 0,
                          borderRadius: 2,
                          bgcolor: '#d98b13',
                        }}
                      />
                      <Typography variant="body2">{text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
              <Typography variant="caption" color="text.secondary">
                Simulação local, sem upload ou integração financeira. As suposições de abastecimento
                e carta estão documentadas no projeto.
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 2 }}>
            <Button component={RouterLink} to="/veiculos" variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Cadastrar veículo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

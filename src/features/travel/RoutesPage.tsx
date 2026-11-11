import { useState } from 'react';
import { Button, Chip, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { driversApi, vehiclesApi } from '@/features/registry/api';
import type { FormSpec } from '@/features/registry/RegistryScreen';
import type { Dto } from '@/shared/api/types';
import { ActionForm } from '@/shared/components/ActionForm';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { DataTable } from '@/shared/components/DataTable';
import { PageHeading } from '@/shared/components/PageHeading';
import { dateTime, statusLabels } from '@/shared/format';
import { routesApi } from './api';
import { scheduleBody, scheduleFields } from './schedule';

const statuses: Dto['RouteStatus'][] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function RoutesPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<Dto['RouteStatus'] | ''>('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleInput, setVehicleInput] = useState('');
  const [driverInput, setDriverInput] = useState('');
  const [form, setForm] = useState<FormSpec | null>(null);
  const filters = {
    page,
    size: 20,
    status: status || undefined,
    vehicleId: vehicleId || undefined,
    driverId: driverId || undefined,
  };
  const query = useQuery({
    queryKey: ['travel', 'routes', filters],
    queryFn: ({ signal }) => routesApi.list(filters, signal),
  });
  const vehicles = useQuery({
    queryKey: ['registry', 'vehicles'],
    queryFn: ({ signal }) => vehiclesApi.list(signal),
  });
  const drivers = useQuery({
    queryKey: ['registry', 'drivers'],
    queryFn: ({ signal }) => driversApi.list(signal),
  });
  const vehicleOptions = vehicles.data
    ?.filter((item) => item.active)
    .map((item) => ({ value: item.id, label: `${item.plate} · ${item.model}` }));
  const driverOptions = drivers.data
    ?.filter((item) => item.active && item.userActive)
    .map((item) => ({ value: item.id, label: item.name }));
  const createForm: FormSpec = {
    title: 'Planejar viagem',
    fields: [
      {
        name: 'vehicleId',
        label: 'Veículo',
        required: true,
        options: vehicleOptions,
        helper: vehicleOptions ? undefined : 'Informe o identificador do veículo.',
      },
      {
        name: 'driverId',
        label: 'Motorista',
        required: true,
        options: driverOptions,
        helper: driverOptions ? undefined : 'Informe o identificador do motorista.',
      },
      ...scheduleFields,
    ],
    submit: (values) =>
      routesApi.create({
        vehicleId: values.vehicleId!,
        driverId: values.driverId!,
        ...scheduleBody(values),
      }),
  };
  return (
    <Stack spacing={2}>
      <PageHeading
        title="Viagens"
        description="Planejamento, agenda e execução das viagens da frota."
        action={
          <Button variant="contained" onClick={() => setForm(createForm)}>
            Planejar viagem
          </Button>
        }
      />
      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();
          setVehicleId(vehicleInput.trim());
          setDriverId(driverInput.trim());
          setPage(0);
        }}
      >
        <TextField
          label="Situação"
          select
          value={status}
          sx={{ minWidth: 180 }}
          onChange={(event) => {
            setStatus(event.target.value as typeof status);
            setPage(0);
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {statuses.map((value) => (
            <MenuItem key={value} value={value}>
              {statusLabels[value]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="ID do veículo"
          value={vehicleInput}
          onChange={(event) => setVehicleInput(event.target.value)}
        />
        <TextField
          label="ID do motorista"
          value={driverInput}
          onChange={(event) => setDriverInput(event.target.value)}
        />
        <Button type="submit" variant="outlined">
          Filtrar
        </Button>
      </Stack>
      <ApiFeedback
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
      {query.isPending ? (
        <Loading />
      ) : (
        !query.error && (
          <>
            <DataTable
              rows={query.data?.content ?? []}
              columns={[
                { label: 'Veículo', render: (row) => row.vehiclePlate },
                { label: 'Motorista', render: (row) => row.driverName },
                { label: 'Saída prevista', render: (row) => dateTime(row.plannedStartAt) },
                { label: 'Retorno previsto', render: (row) => dateTime(row.plannedReturnAt) },
                {
                  label: 'Situação',
                  render: (row) => <Chip size="small" label={statusLabels[row.status]} />,
                },
              ]}
              actions={(row) => (
                <Button component={Link} to={`/viagens/${row.id}`} size="small">
                  Ver viagem
                </Button>
              )}
            />
            <Typography color="text.secondary" variant="body2">
              {query.data?.totalElements ?? 0} viagem(ns)
            </Typography>
            {(query.data?.totalPages ?? 0) > 1 && (
              <Pagination
                aria-label="Páginas de viagens"
                count={query.data!.totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
              />
            )}
          </>
        )
      )}
      <ActionForm form={form} onClose={() => setForm(null)} />
    </Stack>
  );
}

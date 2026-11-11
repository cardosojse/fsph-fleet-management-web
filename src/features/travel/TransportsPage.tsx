import { useState } from 'react';
import { Button, Chip, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ActionForm } from '@/shared/components/ActionForm';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { DataTable } from '@/shared/components/DataTable';
import { PageHeading } from '@/shared/components/PageHeading';
import type { FormSpec } from '@/features/registry/RegistryScreen';
import type { Dto } from '@/shared/api/types';
import { dateTime, statusLabels } from '@/shared/format';
import { transportsApi } from './api';

const statuses: Dto['TransportStatus'][] = ['PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED'];
const createForm: FormSpec = {
  title: 'Solicitar transporte',
  fields: [
    {
      name: 'occurredAt',
      label: 'Data e hora da ocorrência',
      type: 'datetime-local',
      required: true,
    },
    { name: 'serviceType', label: 'Tipo de serviço', required: true, maxLength: 100 },
    { name: 'pickupLocation', label: 'Local de origem', required: true, maxLength: 500 },
    { name: 'destination', label: 'Destino', required: true, maxLength: 500 },
  ],
  submit: (values) =>
    transportsApi.create({
      occurredAt: new Date(values.occurredAt!).toISOString(),
      serviceType: values.serviceType!,
      pickupLocation: values.pickupLocation!,
      destination: values.destination!,
    }),
};

export function TransportsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<Dto['TransportStatus'] | ''>('');
  const [sectorId, setSectorId] = useState('');
  const [sectorInput, setSectorInput] = useState('');
  const [form, setForm] = useState<FormSpec | null>(null);
  const filters = { page, size: 20, status: status || undefined, sectorId: sectorId || undefined };
  const query = useQuery({
    queryKey: ['travel', 'transports', filters],
    queryFn: ({ signal }) => transportsApi.list(filters, signal),
  });
  return (
    <Stack spacing={2}>
      <PageHeading
        title="Transportes"
        description="Solicitações de transporte e acompanhamento dos atendimentos."
        action={
          <Button variant="contained" onClick={() => setForm(createForm)}>
            Solicitar transporte
          </Button>
        }
      />
      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();
          setSectorId(sectorInput.trim());
          setPage(0);
        }}
      >
        <TextField
          select
          label="Situação"
          value={status}
          sx={{ minWidth: 200 }}
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
          label="ID do setor"
          value={sectorInput}
          onChange={(event) => setSectorInput(event.target.value)}
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
                { label: 'Ocorrência', render: (row) => dateTime(row.occurredAt) },
                { label: 'Serviço', render: (row) => row.serviceType },
                { label: 'Origem', render: (row) => row.pickupLocation },
                { label: 'Destino', render: (row) => row.destination },
                {
                  label: 'Situação',
                  render: (row) => <Chip size="small" label={statusLabels[row.status]} />,
                },
              ]}
              actions={(row) => (
                <Button component={Link} to={`/transportes/${row.id}`} size="small">
                  Ver transporte
                </Button>
              )}
            />
            <Typography color="text.secondary" variant="body2">
              {query.data?.totalElements ?? 0} solicitação(ões)
            </Typography>
            {(query.data?.totalPages ?? 0) > 1 && (
              <Pagination
                aria-label="Páginas de transportes"
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

export function TransportDetailPage() {
  const { id = '' } = useParams();
  const [form, setForm] = useState<FormSpec | null>(null);
  const query = useQuery({
    queryKey: ['travel', 'transport', id],
    queryFn: ({ signal }) => transportsApi.find(id, signal),
  });
  const transport = query.data;
  return (
    <Stack spacing={2}>
      <Button component={Link} to="/transportes" sx={{ alignSelf: 'flex-start' }}>
        Voltar aos transportes
      </Button>
      <PageHeading title="Detalhes do transporte" />
      <ApiFeedback
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
      {query.isPending && <Loading />}
      {transport && (
        <>
          <Typography variant="h6">{transport.serviceType}</Typography>
          <Chip sx={{ alignSelf: 'flex-start' }} label={statusLabels[transport.status]} />
          <Typography>Origem: {transport.pickupLocation}</Typography>
          <Typography>Destino: {transport.destination}</Typography>
          <Typography>Ocorrência: {dateTime(transport.occurredAt)}</Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>Identificador: {transport.id}</Typography>
          {['PENDING', 'ASSIGNED'].includes(transport.status) && (
            <Button
              color="error"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() =>
                setForm({
                  title: 'Cancelar esta solicitação de transporte?',
                  fields: [],
                  submit: () => transportsApi.cancel(id),
                })
              }
            >
              Cancelar solicitação
            </Button>
          )}
        </>
      )}
      <ActionForm form={form} onClose={() => setForm(null)} />
    </Stack>
  );
}

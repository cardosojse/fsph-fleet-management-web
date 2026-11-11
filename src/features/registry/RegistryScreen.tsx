import { useState, type ReactNode } from 'react';
import { Alert, Button, Chip, Stack, TextField } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FormDialog, type FormSpec } from '@/shared/components/FormDialog';
import { PageHeading } from '@/shared/components/PageHeading';
import { invalidateData } from '@/shared/api/invalidate';

export type { FormSpec } from '@/shared/components/FormDialog';
export function ActiveChip({ active }: { active: boolean }) {
  return (
    <Chip
      size="small"
      color={active ? 'success' : 'default'}
      label={active ? 'Ativo' : 'Inativo'}
    />
  );
}

export function RegistryScreen<T extends { id: string }>({
  name,
  title,
  createLabel,
  list,
  columns,
  create,
  edit,
  actions,
  filter,
}: {
  name: string;
  title: string;
  createLabel: string;
  list: (signal?: AbortSignal) => Promise<T[]>;
  columns: Column<T>[];
  create: FormSpec;
  edit?: (row: T) => FormSpec;
  actions?: (row: T, open: (form: FormSpec) => void) => ReactNode;
  filter?: (row: T, search: string) => boolean;
}) {
  const [form, setForm] = useState<FormSpec | null>(null);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['registry', name], queryFn: ({ signal }) => list(signal) });
  const rows = (query.data ?? []).filter(
    (row) => !filter || filter(row, search.toLocaleLowerCase('pt-BR')),
  );
  return (
    <Stack spacing={2}>
      <PageHeading
        title={title}
        action={
          <Button
            variant="contained"
            onClick={() => {
              setSaved(false);
              setForm(create);
            }}
          >
            {createLabel}
          </Button>
        }
      />
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Operação concluída.
        </Alert>
      )}
      {filter && (
        <TextField
          label={`Buscar em ${title.toLowerCase()}`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 400 }}
        />
      )}
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
          <DataTable
            rows={rows}
            columns={columns}
            actions={(row) => (
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
              >
                {edit && (
                  <Button size="small" onClick={() => setForm(edit(row))}>
                    Editar
                  </Button>
                )}
                {actions?.(row, setForm)}
              </Stack>
            )}
          />
        )
      )}
      {form && (
        <FormDialog
          title={form.title}
          fields={form.fields}
          defaults={form.defaults}
          onClose={() => setForm(null)}
          onSubmit={async (values) => {
            await form.submit(values);
            await invalidateData(client);
            setSaved(true);
          }}
        />
      )}
    </Stack>
  );
}

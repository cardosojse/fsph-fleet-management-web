import { useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  roles,
  roleLabels,
  permissions,
  permissionLabels,
  type UserRole,
  type Permission,
} from '@/shared/api/types';
import { ApiFeedback, Loading } from '@/shared/components/ApiFeedback';
import { PageHeading } from '@/shared/components/PageHeading';
import { ActionForm } from '@/shared/components/ActionForm';
import { permissionsApi } from './api';

function RolePermissions({ role, initial }: { role: UserRole; initial: Permission[] }) {
  const [selected, setSelected] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6">
          {roleLabels[role]}
        </Typography>
        {role === 'ADMIN' && (
          <Alert severity="info">As permissões do administrador são fixas.</Alert>
        )}
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          {permissions.map((permission) => (
            <FormControlLabel
              key={permission}
              sx={{ minWidth: 260 }}
              label={permissionLabels[permission]}
              control={
                <Checkbox
                  checked={selected.includes(permission)}
                  disabled={role === 'ADMIN'}
                  onChange={(_, checked) =>
                    setSelected((current) =>
                      checked
                        ? [...current, permission]
                        : current.filter((entry) => entry !== permission),
                    )
                  }
                />
              }
            />
          ))}
        </Stack>
        {role !== 'ADMIN' && (
          <Button
            sx={{ alignSelf: 'flex-start' }}
            variant="outlined"
            onClick={() => setConfirm(true)}
          >
            Salvar permissões de {roleLabels[role]}
          </Button>
        )}
      </Stack>
      <ActionForm
        form={
          confirm
            ? {
                title: `Aplicar permissões ao perfil ${roleLabels[role]}?`,
                fields: [],
                submit: () => permissionsApi.replace(role, { permissions: selected }),
              }
            : null
        }
        onClose={() => setConfirm(false)}
      />
    </Paper>
  );
}

export function PermissionsPage() {
  const query = useQuery({
    queryKey: ['permissions'],
    queryFn: ({ signal }) => permissionsApi.list(signal),
  });
  return (
    <Stack spacing={2}>
      <PageHeading
        title="Permissões"
        description="Configure as operações permitidas para cada perfil."
      />
      <ApiFeedback
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
      {query.isPending ? (
        <Loading />
      ) : (
        query.data &&
        roles.map((role) => (
          <RolePermissions
            key={`${role}-${JSON.stringify(query.data?.[role])}`}
            role={role}
            initial={query.data?.[role] ?? []}
          />
        ))
      )}
    </Stack>
  );
}

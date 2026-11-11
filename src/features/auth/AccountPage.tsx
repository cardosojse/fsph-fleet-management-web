import { useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { FormDialog } from '@/shared/components/FormDialog';
import { PageHeading } from '@/shared/components/PageHeading';
import { roleLabels } from '@/shared/api/types';
import { authApi } from './api';
import { useSession } from './useSession';

export function AccountPage() {
  const session = useSession();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <PageHeading title="Minha conta" />
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Senha alterada.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{session.data?.name}</Typography>
          <Typography>{session.data?.email}</Typography>
          <Typography>{session.data && roleLabels[session.data.role]}</Typography>
          <Button
            sx={{ alignSelf: 'flex-start' }}
            variant="outlined"
            onClick={() => setEditing(true)}
          >
            Alterar minha senha
          </Button>
        </Stack>
      </Paper>
      {editing && (
        <FormDialog
          title="Alterar minha senha"
          fields={[
            { name: 'currentPassword', label: 'Senha atual', type: 'password', required: true },
            {
              name: 'newPassword',
              label: 'Nova senha',
              type: 'password',
              required: true,
              minLength: 8,
              maxLength: 72,
            },
          ]}
          onClose={() => setEditing(false)}
          onSubmit={async (values) => {
            await authApi.changePassword({
              currentPassword: values.currentPassword!,
              newPassword: values.newPassword!,
            });
            setSaved(true);
          }}
        />
      )}
    </div>
  );
}

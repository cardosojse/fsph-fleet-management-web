import { Alert, AlertTitle, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { ApiError, errorMessage } from '@/shared/api/result';

export function ApiFeedback({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  return (
    <Alert
      severity="error"
      action={
        retry ? (
          <Button color="inherit" onClick={retry}>
            Tentar novamente
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>
        {error instanceof ApiError && error.status === 403
          ? 'Acesso restrito'
          : 'Não foi possível concluir'}
      </AlertTitle>
      {errorMessage(error)}
      {error instanceof ApiError &&
        error.problem.violations?.map((violation) => (
          <Typography
            component="div"
            variant="body2"
            key={`${violation.field}-${violation.message}`}
          >
            {violation.field}: {violation.message}
          </Typography>
        ))}
    </Alert>
  );
}

export function Loading() {
  return (
    <Stack role="status" direction="row" spacing={2} sx={{ p: 3, alignItems: 'center' }}>
      <CircularProgress size={22} />
      <span>Carregando…</span>
    </Stack>
  );
}

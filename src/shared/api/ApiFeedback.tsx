import { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';

import { apiErrorMessage } from './client';

export function ApiFeedback({ error, retry }: { error: unknown; retry?: () => void }) {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let current = true;
    void apiErrorMessage(error).then((detail) => {
      if (current) setMessage(detail);
    });
    return () => {
      current = false;
    };
  }, [error]);
  return (
    <Alert
      severity="error"
      action={
        retry && (
          <Button color="inherit" onClick={retry}>
            Tentar novamente
          </Button>
        )
      }
    >
      {message || 'Não foi possível concluir a operação.'}
    </Alert>
  );
}

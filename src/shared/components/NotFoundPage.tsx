import { Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 12 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography color="primary" sx={{ fontWeight: 700 }} variant="overline">
          Erro 404
        </Typography>
        <Typography component="h1" variant="h3">
          Página não encontrada
        </Typography>
        <Typography color="text.secondary">
          O endereço informado não existe neste sistema.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Voltar ao início
        </Button>
      </Stack>
    </Container>
  );
}

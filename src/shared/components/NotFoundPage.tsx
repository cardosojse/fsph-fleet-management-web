import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { PublicLayout } from '@/shared/layout/PublicLayout';

export function NotFoundPage() {
  return (
    <PublicLayout eyebrow="Erro 404" title="Página não encontrada">
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        O endereço informado não existe neste sistema. Verifique o link ou volte para a página
        inicial.
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Voltar ao início
      </Button>
    </PublicLayout>
  );
}

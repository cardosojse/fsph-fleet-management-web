import { Box, Stack, Typography } from '@mui/material';

export function InstitutionalFooter() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          gap: 0.5,
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} FSPH — Fundação de Saúde Parreiras Horta
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Serviço de Verificação de Óbito • Ambiente de demonstração
        </Typography>
      </Stack>
    </Box>
  );
}

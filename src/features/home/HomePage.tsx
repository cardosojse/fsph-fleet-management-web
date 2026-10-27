import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';

const foundations = [
  'React + TypeScript',
  'Vite',
  'TanStack Query',
  'OpenAPI',
  'Vitest',
  'Playwright',
];

export function HomePage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 6 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 4, md: 7 } }}
        >
          <Stack spacing={3}>
            <Typography
              color="primary"
              sx={{ fontWeight: 700, letterSpacing: '0.08em' }}
              variant="overline"
            >
              FSPH
            </Typography>
            <Typography component="h1" variant="h1">
              Gestão de Frotas
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.125rem', maxWidth: '62ch' }}>
              Infraestrutura do frontend pronta. As próximas entregas podem evoluir por domínio sem
              acoplar regras de negócio aos componentes compartilhados.
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }} useFlexGap>
              {foundations.map((foundation) => (
                <Chip key={foundation} label={foundation} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

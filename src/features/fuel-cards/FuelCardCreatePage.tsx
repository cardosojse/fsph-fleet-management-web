import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { FuelCardForm } from '@/features/fuel-cards/components/FuelCardForm';
import { FuelCardsHeader } from '@/features/fuel-cards/components/FuelCardsHeader';

export function FuelCardCreatePage() {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Button component={Link} to="/cartoes-combustivel" sx={{ alignSelf: 'flex-start' }}>
          Voltar à listagem
        </Button>
        <FuelCardsHeader
          eyebrow="Cartões / Cadastro"
          title="Novo cartão"
          description="Comece com os dados do cartão. O veículo e o status podem ser definidos depois."
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderTop: '3px solid #157f65' }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Dados do cartão
            </Typography>
            <FuelCardForm />
          </Paper>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700 }}>
              Antes de salvar
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography color="text.secondary" variant="body2">
                Use somente números fictícios. O número é oculto durante a digitação e aparece
                mascarado nas consultas.
              </Typography>
              <Typography color="text.secondary" variant="body2">
                O limite informado não define o saldo. Saldo e status começam como “Não informado”.
              </Typography>
              <Typography color="text.secondary" variant="body2">
                O cadastro fica disponível apenas nesta demonstração, sem envio ao servidor.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}

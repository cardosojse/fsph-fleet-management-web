import { Alert, Button, Container, Paper, Stack } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { FuelCardForm } from '@/features/fuel-cards/components/FuelCardForm';
import { FuelCardsHeader } from '@/features/fuel-cards/components/FuelCardsHeader';
import { useFuelCardsData } from '@/features/fuel-cards/data/FuelCardsProvider';

export function FuelCardEditPage() {
  const { id } = useParams();
  const data = useFuelCardsData();
  const card =
    data?.state.status === 'ready' ? data.state.cards.find((item) => item.id === id) : undefined;
  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button component={Link} to="/cartoes-combustivel" sx={{ alignSelf: 'flex-start' }}>
          Voltar à listagem
        </Button>
        <FuelCardsHeader
          eyebrow="Cartões / Edição"
          title="Editar cartão"
          description="Revise os dados cadastrais. O vínculo, o saldo e o status são preservados."
        />
        {card ? (
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
            <FuelCardForm key={card.id} card={card} />
          </Paper>
        ) : (
          <Alert severity="warning">Cartão não encontrado nesta demonstração.</Alert>
        )}
      </Stack>
    </Container>
  );
}

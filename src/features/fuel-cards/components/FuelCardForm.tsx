import { Alert, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';
import type {
  FuelCardFormValues,
  FuelCardsRepository,
} from '@/features/fuel-cards/data/fuel-cards-repository';
import { useFuelCardsData } from '@/features/fuel-cards/data/FuelCardsProvider';

export function FuelCardForm({ card }: { card?: FuelCard }) {
  const data = useFuelCardsData();
  if (!data?.repository)
    return <Alert severity="info">Integração indisponível. Volte à listagem.</Alert>;
  return <FuelCardFields key={card?.id ?? 'new'} card={card} repository={data.repository} />;
}

function FuelCardFields({
  card,
  repository,
}: {
  card?: FuelCard;
  repository: FuelCardsRepository;
}) {
  const data = useFuelCardsData();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FuelCardFormValues>({
    resolver: zodResolver(card ? repository.editSchema : repository.formSchema),
    defaultValues: {
      number: '',
      limit: card?.totalLimit?.toFixed(2).replace('.', ',') ?? '',
      validity: card?.validity?.split('/').reverse().join('-') ?? '',
    },
  });
  const { ref: numberRef, ...numberField } = register('number');
  const { ref: limitRef, ...limitField } = register('limit');
  const { ref: validityRef, ...validityField } = register('validity');

  async function submit(values: FuelCardFormValues) {
    if (!data) return;
    const result = await (card ? data.editCard(card.id, values) : data.createCard(values));
    if ('error' in result) {
      setError('number', { message: result.error }, { shouldFocus: true });
      return;
    }
    navigate(card ? `/cartoes-combustivel/${card.id}` : '/cartoes-combustivel');
  }

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(submit)} spacing={3}>
      {repository.mode === 'demo' && (
        <Alert severity="info" role="note">
          Use apenas números fictícios. Validações provisórias: 8 a 19 dígitos, limite maior que
          zero e validade no mês atual ou futuro.{' '}
          {card
            ? 'Editar o limite não altera o saldo ou o status.'
            : 'O saldo e o status iniciais ficam como “Não informado”.'}
        </Alert>
      )}
      <TextField
        label={card ? 'Novo número do cartão' : 'Número do cartão'}
        type="password"
        required={!card}
        autoComplete="new-password"
        {...numberField}
        inputRef={numberRef}
        error={Boolean(errors.number)}
        helperText={
          errors.number?.message ??
          (card
            ? `Atual: ${card.card}. Deixe vazio para manter o número.`
            : 'Número oculto durante a digitação. Espaços e hífens são permitidos.')
        }
        slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 40 } }}
      />
      <TextField
        label="Limite total (R$)"
        required
        {...limitField}
        inputRef={limitRef}
        error={Boolean(errors.limit)}
        helperText={errors.limit?.message ?? 'Exemplo: 1500,00. Não use separador de milhar.'}
        slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 20 } }}
      />
      <TextField
        label="Validade"
        type="month"
        required
        {...validityField}
        inputRef={validityRef}
        error={Boolean(errors.validity)}
        helperText={errors.validity?.message ?? 'Mês e ano de validade.'}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || data?.busy}
          sx={{ minHeight: 44 }}
        >
          {card
            ? 'Salvar alterações'
            : repository.mode === 'demo'
              ? 'Salvar cartão demonstrativo'
              : 'Salvar cartão'}
        </Button>
        <Button
          component={Link}
          to="/cartoes-combustivel"
          variant="outlined"
          sx={{ minHeight: 44 }}
        >
          {card ? 'Cancelar edição' : 'Cancelar cadastro'}
        </Button>
      </Stack>
    </Stack>
  );
}

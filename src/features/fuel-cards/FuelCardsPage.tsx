import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FuelCardsList } from '@/features/fuel-cards/components/FuelCardsList';
import { FuelCardsHeader } from '@/features/fuel-cards/components/FuelCardsHeader';
import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';
import { useFuelCardsData } from '@/features/fuel-cards/data/FuelCardsProvider';

type FuelCardsState =
  | { status: 'ready'; cards: FuelCard[] }
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'error'; onRetry?: () => void };
interface FuelCardsPageProps {
  state?: FuelCardsState;
}

export function FuelCardsPage({ state: providedState }: FuelCardsPageProps) {
  const data = useFuelCardsData();
  const state: FuelCardsState =
    providedState ??
    (data?.state.status === 'error'
      ? { status: 'error', onRetry: data.retry }
      : (data?.state ?? { status: 'unavailable' }));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sector, setSector] = useState('');
  const cards = state.status === 'ready' ? state.cards : [];
  const vehicles = data?.state.status === 'ready' ? data.state.vehicles : [];
  const sectors = [
    ...new Set([...cards, ...vehicles].flatMap((item) => (item.sector ? [item.sector] : []))),
  ].sort();
  const statuses = [...new Set(cards.flatMap((card) => (card.status ? [card.status] : [])))].sort();
  const query = search.trim().toLocaleLowerCase('pt-BR').replace(/[\s-]/g, '');
  const filtered = cards.filter(
    (card) =>
      (!query ||
        card.card?.replace(/\D/g, '').includes(query) ||
        card.vehicle?.toLocaleLowerCase('pt-BR').replace(/[\s-]/g, '').includes(query)) &&
      (!status || (status === 'unknown' ? !card.status : card.status === status)) &&
      (!sector || (sector === 'unknown' ? !card.sector : card.sector === sector)),
  );
  const hasFilters = Boolean(search || status || sector);
  function clearFilters() {
    setSearch('');
    setStatus('');
    setSector('');
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <FuelCardsHeader
          eyebrow="Frota / Combustível"
          title="Cartões de combustível"
          description="Consulte limites, saldos e vínculos dos cartões da frota."
          action={
            state.status === 'ready' ? (
              <Button
                component={Link}
                to="/cartoes-combustivel/novo"
                variant="contained"
                sx={{ whiteSpace: 'nowrap', px: 3 }}
              >
                <Box component="span" aria-hidden="true" sx={{ mr: 1 }}>
                  +
                </Box>
                Novo cartão
              </Button>
            ) : undefined
          }
        />
        {state.status === 'ready' && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {[
                ['Cartões cadastrados', String(cards.length), 'Visão geral dos cartões'],
                [
                  'Cartões vinculados',
                  String(cards.filter((card) => card.vehicle).length),
                  'Cartões com vínculo informado',
                ],
                [
                  'Cartões ativos',
                  String(cards.filter((card) => card.status === 'Ativo').length),
                  'Status informado',
                ],
              ].map(([label, value, description]) => (
                <Paper
                  key={label}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderTop: '3px solid',
                    borderTopColor: label === 'Cartões ativos' ? 'secondary.main' : 'primary.main',
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 32,
                      fontWeight: 750,
                      my: 0.5,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Paper
              component="section"
              aria-label="Pesquisa e filtros"
              variant="outlined"
              sx={{ p: 2.5 }}
            >
              <Stack spacing={2}>
                <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Encontre um cartão
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Pesquisar por final do cartão ou placa"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    size="small"
                  />
                  <TextField
                    select
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todos os status</MenuItem>
                    {statuses.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                    <MenuItem value="unknown">Não informado</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Setor"
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todos os setores</MenuItem>
                    {sectors.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                    <MenuItem value="unknown">Não informado</MenuItem>
                  </TextField>
                </Box>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary" aria-live="polite">
                    {filtered.length} de {cards.length} cartões
                  </Typography>
                  <Button onClick={clearFilters} disabled={!hasFilters}>
                    Limpar filtros
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </>
        )}
        <Box
          component="section"
          aria-label="Consulta de cartões"
          aria-busy={state.status === 'loading'}
        >
          {state.status === 'loading' && (
            <Paper variant="outlined" role="status" sx={{ p: 4 }}>
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <CircularProgress aria-label="Carregando cartões" />
                <Typography>Carregando cartões. Aguarde um momento.</Typography>
              </Stack>
            </Paper>
          )}
          {state.status === 'unavailable' && (
            <Alert severity="info">
              Integração indisponível. Nenhum dado fictício está sendo exibido.
            </Alert>
          )}
          {state.status === 'error' && (
            <Alert severity="error">
              <Typography>
                Não foi possível carregar os cartões. Tente novamente mais tarde.
              </Typography>
              {state.onRetry && (
                <Button color="inherit" variant="outlined" onClick={state.onRetry} sx={{ mt: 2 }}>
                  Tentar novamente
                </Button>
              )}
            </Alert>
          )}
          {state.status === 'ready' &&
            (filtered.length ? (
              <FuelCardsList cards={filtered} />
            ) : (
              <Paper
                variant="outlined"
                role="status"
                sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}
              >
                <Typography component="h2" variant="h6">
                  {cards.length
                    ? 'Nenhum resultado para esta pesquisa'
                    : 'Nenhum cartão encontrado'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {cards.length
                    ? 'Tente outro final de cartão, placa ou ajuste os filtros.'
                    : 'Quando houver cartões cadastrados, eles aparecerão aqui.'}
                </Typography>
                {hasFilters && (
                  <Button onClick={clearFilters} sx={{ mt: 2 }}>
                    Mostrar todos os cartões
                  </Button>
                )}
              </Paper>
            ))}
        </Box>
      </Stack>
    </Container>
  );
}

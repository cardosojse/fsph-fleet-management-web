import {
  Box,
  Chip,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const missing = 'Não informado';

function fields(card: FuelCard) {
  return [
    ['Cartão', card.card ?? missing],
    ['Veículo vinculado', card.vehicle ?? missing],
    ['Setor', card.sector ?? missing],
    ['Limite total', card.totalLimit == null ? missing : currency.format(card.totalLimit)],
    [
      'Saldo disponível',
      card.availableBalance == null ? missing : currency.format(card.availableBalance),
    ],
    ['Validade', card.validity ?? missing],
    ['Status', card.status ?? missing],
  ] as const;
}

export function FuelCardsList({ cards }: { cards: FuelCard[] }) {
  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', lg: 'block' } }}
      >
        <Table aria-label="Cartões de combustível">
          <TableHead>
            <TableRow>
              {[
                'Cartão',
                'Veículo vinculado',
                'Setor',
                'Limite total',
                'Saldo disponível',
                'Validade',
                'Status',
              ].map((label) => (
                <TableCell
                  key={label}
                  scope="col"
                  align={
                    label === 'Limite total' || label === 'Saldo disponível' ? 'right' : 'left'
                  }
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id} hover>
                {fields(card).map(([label, value]) => (
                  <TableCell
                    key={label}
                    component={label === 'Cartão' ? 'th' : 'td'}
                    scope={label === 'Cartão' ? 'row' : undefined}
                    align={
                      label === 'Limite total' || label === 'Saldo disponível' ? 'right' : 'left'
                    }
                    sx={{ fontVariantNumeric: 'tabular-nums', py: 2, overflowWrap: 'anywhere' }}
                  >
                    {label === 'Status' ? (
                      <Chip
                        label={value}
                        size="small"
                        variant="outlined"
                        sx={
                          value === 'Indisponível'
                            ? { color: '#805000', bgcolor: '#fff6df', borderColor: '#d9bd83' }
                            : value === 'Ativo'
                              ? { color: '#17634a', bgcolor: '#edf7f1', borderColor: '#b4d6c4' }
                              : undefined
                        }
                        color={
                          value === 'Ativo'
                            ? 'success'
                            : value === 'Indisponível'
                              ? 'warning'
                              : 'default'
                        }
                      />
                    ) : label === 'Cartão' ? (
                      <Link
                        component={RouterLink}
                        to={`/cartoes-combustivel/${card.id}`}
                        aria-label={`Ver detalhes do cartão ${value}`}
                        sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
                      >
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: { xs: 'grid', lg: 'none' },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <Paper component="article" variant="outlined" key={card.id} sx={{ p: 2, minWidth: 0 }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              <Link
                component={RouterLink}
                to={`/cartoes-combustivel/${card.id}`}
                sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
              >
                Cartão {card.card ?? missing}
              </Link>
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {fields(card)
                .slice(1)
                .map(([label, value]) => (
                  <Box key={label} sx={{ mb: 1.5 }}>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </>
  );
}

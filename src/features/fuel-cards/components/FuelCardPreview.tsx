import { Box, Chip, Typography } from '@mui/material';
import type { FuelCard } from '@/features/fuel-cards/fuel-card.types';

export function FuelCardPreview({ card }: { card: FuelCard }) {
  return (
    <Box
      aria-label="Representação do cartão demonstrativo"
      sx={{
        bgcolor: '#10192c',
        color: '#fff',
        borderRadius: 3,
        p: { xs: 2.5, sm: 3.5 },
        minHeight: 235,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 30px #10192c20',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: -50,
          bottom: -90,
          width: 240,
          height: 240,
          border: '1px solid #ffffff20',
          borderRadius: '50%',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 24, letterSpacing: '-.04em' }}>
            FSPH.
          </Typography>
          <Typography sx={{ color: '#b8c8da', fontSize: 11, letterSpacing: '.14em' }}>
            FROTA ADMINISTRATIVA
          </Typography>
        </Box>
        <Chip
          label={card.status ?? 'Não informado'}
          size="small"
          sx={{ color: 'white', bgcolor: '#ffffff18', border: '1px solid #ffffff30' }}
        />
      </Box>
      <Box
        sx={{
          width: 37,
          height: 28,
          borderRadius: 1,
          bgcolor: '#bda87a',
          border: '1px solid #ddca9f',
          mt: 2,
        }}
        aria-hidden="true"
      >
        <Box
          sx={{
            height: '50%',
            width: '55%',
            borderRight: '1px solid #756642',
            borderBottom: '1px solid #756642',
          }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{ fontSize: { xs: 23, sm: 27 }, fontFamily: 'monospace', letterSpacing: '.14em' }}
        >
          {card.card ?? 'Não informado'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#c7d3e2' }}>
            COMBUSTÍVEL · DEMONSTRAÇÃO
          </Typography>
          <Typography variant="caption">VALIDADE {card.validity ?? 'Não informada'}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

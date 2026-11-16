import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function FuelCardsHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
    >
      <Box>
        <Typography
          variant="overline"
          color="secondary"
          sx={{ fontWeight: 700, letterSpacing: '.12em' }}
        >
          {eyebrow}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 27, md: 34 },
            fontWeight: 750,
            letterSpacing: '-.035em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '65ch' }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

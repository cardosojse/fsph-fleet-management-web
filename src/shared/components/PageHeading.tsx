import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
    >
      <div>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </div>
      {action}
    </Stack>
  );
}

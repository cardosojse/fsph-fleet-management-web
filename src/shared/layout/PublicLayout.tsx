import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { tokens } from '@/app/theme';

import { InstitutionalFooter } from './InstitutionalFooter';

interface PublicLayoutProps {
  /** Linha acima do título, ex.: "SVO / ACESSO". */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Largura máxima do cartão central. */
  width?: number;
  children: ReactNode;
  /** Conteúdo abaixo do cartão (links secundários). */
  after?: ReactNode;
}

export function InstitutionalHeader() {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: tokens.navy[800],
        color: 'white',
        borderBottom: `3px solid ${tokens.blue[800]}`,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          minHeight: { xs: 64, sm: 76 },
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 22, sm: 26 }, letterSpacing: '0.02em' }}>
          SVO
        </Typography>
        <Box sx={{ width: '1px', alignSelf: 'stretch', my: 2, bgcolor: tokens.navy[600] }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 }, lineHeight: 1.35 }}>
            Frota administrativa
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {' '}
              • Serviço de Verificação de Óbito
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 12, color: tokens.navy[200] }}>
            Fundação de Saúde Parreiras Horta
          </Typography>
        </Box>
        <Stack
          direction="row"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 0.75,
            fontSize: 12,
            color: tokens.navy[200],
          }}
        >
          <LockOutlined aria-hidden sx={{ fontSize: 16 }} />
          Acesso institucional
        </Stack>
      </Stack>
    </Box>
  );
}

export function PublicLayout({
  eyebrow = 'SVO / ACESSO',
  title,
  description,
  width = 460,
  children,
  after,
}: PublicLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <InstitutionalHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: { sm: 'flex-start' },
          px: 2,
          py: { xs: 3, sm: 7 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: width }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, sm: 4 }, borderColor: tokens.border.strong }}
          >
            <Typography variant="overline" color="primary" component="p" sx={{ fontSize: 11 }}>
              {eyebrow}
            </Typography>
            <Typography component="h1" variant="h1">
              {title}
            </Typography>
            {description && (
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14, lineHeight: 1.6 }}>
                {description}
              </Typography>
            )}
            <Box sx={{ mt: 3 }}>{children}</Box>
          </Paper>
          {after && <Box sx={{ mt: 2, textAlign: 'center' }}>{after}</Box>}
        </Box>
      </Box>
      <InstitutionalFooter />
    </Box>
  );
}

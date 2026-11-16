import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { tokens } from '@/app/theme';
import { InstitutionalFooter } from '@/shared/layout/InstitutionalFooter';
import { InstitutionalHeader } from '@/shared/layout/PublicLayout';

const sections = [
  {
    title: 'Acesso',
    links: [
      { to: '/login', label: 'Entrar no sistema', hint: 'Login com conta institucional' },
      { to: '/cadastro', label: 'Cadastro de usuário', hint: 'Solicitar acesso ao sistema' },
      { to: '/recuperar-senha', label: 'Esqueci minha senha', hint: 'Recuperar acesso à conta' },
    ],
  },
  {
    title: 'Gestão',
    links: [
      { to: '/dashboard/demo', label: 'Dashboard', hint: 'Visão geral da frota' },
      { to: '/usuarios', label: 'Lista de usuários', hint: 'Contas, perfis e auditoria' },
    ],
  },
];

export function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <InstitutionalHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 7 },
        }}
      >
        <Typography variant="overline" color="primary" component="p" sx={{ fontSize: 11 }}>
          FSPH
        </Typography>
        <Typography component="h1" variant="h1">
          Gestão de Frotas
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '62ch', lineHeight: 1.6 }}>
          Sistema de gestão da frota administrativa e do Serviço de Verificação de Óbito. Escolha
          abaixo a área que deseja acessar.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            mt: 4,
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            alignItems: 'start',
          }}
        >
          {sections.map((section) => (
            <Paper key={section.title} variant="outlined" component="section">
              <Typography
                component="h2"
                variant="h3"
                sx={{ px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider' }}
              >
                {section.title}
              </Typography>
              <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {section.links.map((link, index) => (
                  <li key={link.to}>
                    <ButtonBase
                      component={RouterLink}
                      to={link.to}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        gap: 2,
                        px: 2.5,
                        py: 1.75,
                        borderTop: index ? 1 : 0,
                        borderColor: 'divider',
                        '&:hover': { bgcolor: tokens.surface.sunken },
                        '&.Mui-focusVisible': { outline: `2px solid ${tokens.blue[600]}` },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: 15 }}>
                          {link.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {link.hint}
                        </Typography>
                      </Box>
                      <ChevronRightRounded aria-hidden sx={{ color: 'text.disabled' }} />
                    </ButtonBase>
                  </li>
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
          Infraestrutura do frontend pronta. Os módulos são entregues por domínio e utilizam dados
          demonstrativos até a integração com a API.
        </Typography>
      </Box>
      <InstitutionalFooter />
    </Box>
  );
}

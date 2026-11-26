import CloseRounded from '@mui/icons-material/CloseRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { tokens } from '@/app/theme';
import { authToken } from '@/shared/api/auth-token';

import { demoUser } from './demo-user';
import type { LayoutUser } from './demo-user';
import { navigation } from './navigation';
import type { NavItem, NavKey } from './navigation';

export interface Crumb {
  label: string;
  to?: string;
}

interface AppLayoutProps {
  active: NavKey;
  title: string;
  breadcrumbs: Crumb[];
  subtitle?: ReactNode;
  actions?: ReactNode;
  user?: LayoutUser;
  children: ReactNode;
}

const SIDEBAR_WIDTH = 248;
const mobile = (theme: Theme) => theme.breakpoints.down('md');

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AppLayout({
  active,
  title,
  breadcrumbs,
  subtitle,
  actions,
  user = demoUser,
  children,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  function openPending(item: NavItem) {
    setMenuOpen(false);
    setPending(item.label);
  }

  function logout() {
    authToken.clear();
    navigate('/login', { replace: true });
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `${SIDEBAR_WIDTH}px minmax(0, 1fr)` },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box
        id="menu-principal"
        component="aside"
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: tokens.navy[800],
          color: tokens.navy[100],
          [mobile(theme)]: {
            position: 'fixed',
            inset: 0,
            right: 'auto',
            width: 'min(288px, 86vw)',
            zIndex: theme.zIndex.drawer,
            transform: menuOpen ? 'none' : 'translateX(-100%)',
            visibility: menuOpen ? 'visible' : 'hidden',
            transition: theme.transitions.create(['transform', 'visibility'], {
              duration: theme.transitions.duration.shorter,
            }),
          },
        })}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            minHeight: 64,
            borderBottom: `1px solid ${tokens.navy[600]}`,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'white', fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>
              SVO
            </Typography>
            <Typography sx={{ fontSize: 12, color: tokens.navy[200] }}>
              Frota administrativa
            </Typography>
          </Box>
          <IconButton
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            sx={{ color: 'white', display: { md: 'none' }, mr: -1 }}
          >
            <CloseRounded />
          </IconButton>
        </Stack>

        <Box component="nav" aria-label="Menu principal" sx={{ px: 1.5, py: 2 }}>
          {navigation.map((group) => (
            <Box key={group.label} sx={{ mb: 2 }}>
              <Typography
                component="p"
                sx={{
                  px: 1.5,
                  mb: 0.5,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: tokens.navy[300],
                }}
              >
                {group.label}
              </Typography>
              <Stack spacing={0.25}>
                {group.items.map((item) => (
                  <NavButton
                    key={item.key}
                    item={item}
                    current={item.key === active}
                    onPending={openPending}
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 'auto',
            px: 2.5,
            py: 2,
            borderTop: `1px solid ${tokens.navy[600]}`,
            fontSize: 12,
            lineHeight: 1.5,
            color: tokens.navy[300],
          }}
        >
          Fundação de Saúde Parreiras Horta
          <br />
          Serviço de Verificação de Óbito
        </Box>
      </Box>

      {menuOpen && (
        <Box
          aria-hidden
          onClick={() => setMenuOpen(false)}
          sx={(theme) => ({
            display: 'none',
            [mobile(theme)]: {
              display: 'block',
              position: 'fixed',
              inset: 0,
              zIndex: theme.zIndex.drawer - 1,
              bgcolor: 'rgba(15, 23, 42, 0.45)',
            },
          })}
        />
      )}

      <Box component="main" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: { xs: 2, md: 4 },
            minHeight: 64,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton
            aria-label="Abrir menu"
            aria-controls="menu-principal"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            sx={{ display: { md: 'none' }, ml: -1 }}
          >
            <MenuRounded />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Breadcrumbs sx={{ fontSize: 13, display: { xs: 'none', sm: 'block' } }}>
              {breadcrumbs.map((crumb, index) =>
                crumb.to ? (
                  <Link key={crumb.label} component={RouterLink} to={crumb.to}>
                    {crumb.label}
                  </Link>
                ) : (
                  <Typography
                    key={crumb.label}
                    sx={{ fontSize: 13 }}
                    color={index === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                    aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {crumb.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>
          </Box>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}
            >
              {initials(user.name)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.3 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 12 }} color="text.secondary">
                {user.role} • {user.scope}
              </Typography>
            </Box>
            <Box
              sx={{
                width: '1px',
                height: 28,
                bgcolor: 'divider',
                mx: 0.5,
                display: { xs: 'none', sm: 'block' },
              }}
            />
            <Button
              onClick={logout}
              color="inherit"
              startIcon={<LogoutRounded fontSize="small" />}
              sx={{ color: 'text.secondary' }}
            >
              Sair
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2.5, md: 3 },
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}
          >
            <Box>
              <Typography component="h1" variant="h1">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions}
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 }, flex: 1 }}>{children}</Box>
      </Box>

      <Dialog
        open={!!pending}
        onClose={() => setPending(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="modulo-pendente-titulo"
      >
        <DialogTitle id="modulo-pendente-titulo">{pending}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Esta funcionalidade ainda não está implementada neste projeto. Nenhuma operação foi
            executada.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function NavButton({
  item,
  current,
  onPending,
  onNavigate,
}: {
  item: NavItem;
  current: boolean;
  onPending: (item: NavItem) => void;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const sx = {
    justifyContent: 'flex-start',
    gap: 1.5,
    width: '100%',
    px: 1.5,
    py: 1,
    borderRadius: 1,
    fontSize: 14,
    fontWeight: current ? 600 : 500,
    color: current ? 'white' : tokens.navy[100],
    bgcolor: current ? tokens.blue[800] : 'transparent',
    '&:hover': { bgcolor: current ? tokens.blue[800] : tokens.navy[700], color: 'white' },
    '&.Mui-focusVisible': { outline: `2px solid ${tokens.blue[100]}`, outlineOffset: 1 },
  } as const;
  const content = (
    <>
      <Icon aria-hidden sx={{ fontSize: 20 }} />
      <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
        {item.label}
      </Box>
    </>
  );

  if (item.to) {
    return (
      <ButtonBase
        component={RouterLink}
        to={item.to}
        aria-current={current ? 'page' : undefined}
        onClick={onNavigate}
        sx={sx}
      >
        {content}
      </ButtonBase>
    );
  }
  return (
    <ButtonBase aria-haspopup="dialog" onClick={() => onPending(item)} sx={sx}>
      {content}
    </ButtonBase>
  );
}

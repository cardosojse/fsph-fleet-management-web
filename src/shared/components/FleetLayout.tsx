import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { FleetDataProvider } from '@/features/home/FleetDataProvider';

export function FleetLayout() {
  return (
    <FleetDataProvider>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 1500,
          bgcolor: 'white',
          p: 1,
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          '&:focus': { width: 'auto', height: 'auto', clipPath: 'none' },
        }}
      >
        Ir para o conteúdo
      </Box>
      <Box sx={{ display: { md: 'flex' }, minHeight: '100vh' }}>
        <Box
          component="aside"
          sx={{
            bgcolor: '#101828',
            color: 'white',
            width: { md: 244 },
            flexShrink: 0,
            p: { xs: 2, md: 3 },
            position: { md: 'sticky' },
            top: 0,
            height: { md: '100vh' },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            FSPH
          </Typography>
          <Typography variant="caption" sx={{ color: '#b9c2d0' }}>
            Gestão de frotas
          </Typography>
          <Stack
            component="nav"
            aria-label="Navegação principal"
            direction={{ xs: 'row', md: 'column' }}
            spacing={1}
            sx={{ mt: 4 }}
          >
            {(
              [
                ['/motoristas', 'Motoristas'],
                ['/veiculos', 'Veículos'],
              ] as const
            ).map(([path, label]) => (
              <Button
                key={path}
                component={NavLink}
                to={path}
                sx={{
                  color: '#e5e7eb',
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1.25,
                  '&.active': { bgcolor: '#1f2937', color: '#fff' },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ mt: 5 }}>
            <Divider sx={{ borderColor: '#344054', mb: 2 }} />
            <Typography variant="caption" sx={{ color: '#b9c2d0' }}>
              Frota administrativa · FSPH
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </FleetDataProvider>
  );
}

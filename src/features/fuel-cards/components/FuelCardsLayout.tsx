import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useFuelCardsData } from '@/features/fuel-cards/data/FuelCardsProvider';

/** Contêiner local sem menu principal, pronto para compor o layout da equipe. */
export function FuelCardsLayout() {
  const data = useFuelCardsData();
  const { pathname } = useLocation();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    content.current?.focus();
  }, [pathname]);
  const demo = data?.mode === 'demo';
  const ready = data?.state.status === 'ready';
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f6f9',
        color: '#17243a',
        '& .MuiButton-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
        '& .MuiTableCell-head': { bgcolor: '#f7f9fb', color: '#526174', fontWeight: 600 },
        '& :focus-visible:not([tabindex="-1"])': { outline: '3px solid #157f65', outlineOffset: 3 },
      }}
    >
      <Box
        component="a"
        href="#fuel-cards-content"
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 1600,
          bgcolor: 'white',
          p: 0,
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          '&:focus': { width: 'auto', height: 'auto', clipPath: 'none', p: 1 },
        }}
      >
        Ir para o conteúdo
      </Box>
      <Stack
        component="header"
        direction="row"
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: '#101828',
          color: 'white',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 25, fontWeight: 800 }}>
            FSPH
            <Box component="span" sx={{ color: '#79c7b1' }}>
              .
            </Box>
          </Typography>
          <Typography variant="caption" sx={{ color: '#bec9d7' }}>
            Gestão de frotas · Cartões de combustível
          </Typography>
        </Box>
        <Chip
          label={
            demo ? 'Ambiente demonstrativo' : ready ? 'Dados do sistema' : 'Integração pendente'
          }
          size="small"
          sx={{ bgcolor: '#fff3d6', color: '#755000', fontWeight: 600 }}
        />
      </Stack>
      <Box id="fuel-cards-content" ref={content} tabIndex={-1} sx={{ outline: 'none' }}>
        {ready ? (
          <Outlet />
        ) : (
          <Container component="main" maxWidth="lg" sx={{ py: 5 }}>
            <Stack spacing={3}>
              {pathname !== '/cartoes-combustivel' && (
                <Button component={Link} to="/cartoes-combustivel" sx={{ alignSelf: 'flex-start' }}>
                  Voltar à listagem
                </Button>
              )}
              <Typography component="h1" variant="h4">
                Cartões de combustível
              </Typography>
              {data?.state.status === 'loading' ? (
                <Stack role="status" spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                  <CircularProgress aria-label="Carregando cartões" />
                  <Typography>Carregando cartões e veículos.</Typography>
                </Stack>
              ) : data?.state.status === 'error' ? (
                <Alert severity="error">
                  Não foi possível carregar os cartões e veículos.
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={data.retry}>Tentar novamente</Button>
                  </Box>
                </Alert>
              ) : (
                <Alert severity="info" role="status">
                  Integração indisponível. Os cartões e veículos reais estarão disponíveis quando a
                  conexão com o sistema for configurada. Nenhum dado fictício está sendo exibido.
                </Alert>
              )}
            </Stack>
          </Container>
        )}
      </Box>
      <Typography
        component="footer"
        variant="caption"
        color="text.secondary"
        sx={{ px: { xs: 2, md: 4 }, pb: 3, display: 'block', maxWidth: 1200, mx: 'auto' }}
      >
        {demo
          ? 'Modo demonstrativo: dados fictícios, sem integração com a API. Alterações em memória; recarregar ou sair da área restaura os exemplos.'
          : 'Integração real ainda não configurada. Nenhuma requisição a endpoints não confirmados é realizada.'}
      </Typography>
    </Box>
  );
}

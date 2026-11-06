import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type Scenario = 'off' | 'loading' | 'error' | 'empty';

// Preview only: never reads or replaces the registration lists.
export function DemoStates() {
  const [scenario, setScenario] = useState<Scenario>('off');
  const [retrying, setRetrying] = useState(false);
  const [recovered, setRecovered] = useState(false);
  useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => {
      setRetrying(false);
      setRecovered(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [retrying]);
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Simulação demonstrativa"
      sx={{ p: 3 }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle2">Simulação demonstrativa de estados</Typography>
        <Typography variant="body2" color="text.secondary">
          Prévia isolada: não altera a listagem nem os cadastros acima. Nenhuma chamada à API é
          realizada.
        </Typography>
        <TextField
          select
          label="Estado demonstrativo"
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value as Scenario);
            setRetrying(false);
            setRecovered(false);
          }}
        >
          <MenuItem value="off">Desativado</MenuItem>
          <MenuItem value="loading">Carregamento</MenuItem>
          <MenuItem value="error">Erro</MenuItem>
          <MenuItem value="empty">Lista vazia</MenuItem>
        </TextField>
        <Box aria-live="polite">
          {(scenario === 'loading' || retrying) && (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress size={24} aria-label="Carregando simulação" />
              <Typography role="status">Carregando dados demonstrativos…</Typography>
            </Stack>
          )}
          {scenario === 'error' && !retrying && !recovered && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => setRetrying(true)}>
                  Tentar novamente
                </Button>
              }
            >
              Falha simulada ao carregar dados.
            </Alert>
          )}
          {scenario === 'error' && recovered && (
            <Alert severity="success">Nova tentativa demonstrativa concluída.</Alert>
          )}
          {scenario === 'empty' && (
            <Alert severity="info">Nenhum cadastro nesta lista demonstrativa.</Alert>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

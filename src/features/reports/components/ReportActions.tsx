import { Box, Button, Stack, Typography } from '@mui/material';

export function ReportActions({
  ready = false,
  busy = false,
  sharedSnapshot = false,
  onPdf,
  onExcel,
  onPrint,
}: {
  ready?: boolean;
  busy?: boolean;
  sharedSnapshot?: boolean;
  onPdf?: () => void;
  onExcel?: () => void;
  onPrint?: () => void;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        useFlexGap
        sx={{ flexWrap: 'wrap', gap: 1.5, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
      >
        <Button
          variant="contained"
          disabled={!ready || busy}
          onClick={onPdf}
          aria-describedby="report-actions-status"
        >
          Gerar PDF
        </Button>
        <Button
          variant="outlined"
          disabled={!ready || busy}
          onClick={onExcel}
          aria-describedby="report-actions-status"
        >
          Gerar Excel
        </Button>
        <Button
          variant="outlined"
          disabled={!ready || busy}
          onClick={onPrint}
          aria-describedby="report-actions-status"
        >
          Imprimir
        </Button>
      </Stack>
      <Typography
        id="report-actions-status"
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1.25, textAlign: { sm: 'right' } }}
      >
        {ready
          ? sharedSnapshot
            ? 'PDF, Excel e impressão utilizam os mesmos dados da consulta realizada. Após 30 minutos, poderá ser necessário realizar uma nova consulta.'
            : 'Impressão utiliza os dados consultados. PDF e Excel consultam novamente o backend e podem refletir alterações posteriores.'
          : 'Ações indisponíveis: consulte um relatório autorizado com dados e filtros válidos e atualizados.'}
      </Typography>
    </Box>
  );
}

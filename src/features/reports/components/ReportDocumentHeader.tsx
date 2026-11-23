import { Box, Typography } from '@mui/material';
import { moduleLabels, type ReportFilters } from '../reports.types';

export function ReportDocumentHeader({
  title,
  module,
  kind,
  reference,
  referencePrintOnly,
  period,
  appliedFilters,
}: {
  title: string;
  module: ReportFilters['module'];
  kind: ReportFilters['kind'];
  reference?: string;
  referencePrintOnly?: boolean;
  period?: string;
  appliedFilters?: string;
}) {
  return (
    <Box component="header">
      <Typography variant="overline" sx={{ fontWeight: 700 }}>
        FSPH · <span className="reports-screen-only">Relatórios</span>
        <span className="reports-print-only">Sistema de Gestão de Frotas</span>
      </Typography>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography className="reports-print-only">
        Módulo: {moduleLabels[module]} · Tipo: {kind === 'general' ? 'Geral' : 'Individual'}
      </Typography>
      {reference && (
        <Typography
          className={referencePrintOnly ? 'reports-print-only' : undefined}
          sx={{ mt: 2 }}
        >
          Referência: {reference}
        </Typography>
      )}
      {period && <Typography sx={{ mt: 2 }}>Período aplicado: {period}</Typography>}
      {appliedFilters && <Typography>Filtros: {appliedFilters}</Typography>}
    </Box>
  );
}

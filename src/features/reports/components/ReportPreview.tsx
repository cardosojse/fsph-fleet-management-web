import {
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import type { FuelingReport, SvoFleetReport } from '../reports.api';

import {
  getReportLabel,
  getSvoIndicator,
  isSvoOperationIndicator,
  moduleLabels,
  tripPeriods,
  type ReportFilters,
} from '../reports.types';
import { validateReportFilters } from '../reports.validation';
import { ReportDocumentHeader } from './ReportDocumentHeader';

function formatDate(value: string) {
  return value.split('-').reverse().join('/');
}

export function ReportPreview({
  filters,
  report,
  svoReport,
  stale = false,
}: {
  filters: ReportFilters;
  report?: FuelingReport;
  svoReport?: SvoFleetReport;
  stale?: boolean;
}) {
  if (svoReport) {
    const percentage = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (
      <Paper
        component="section"
        variant="outlined"
        className="report-print-preview"
        aria-label={svoReport.title}
        sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.default' }}
      >
        <Stack spacing={2}>
          <ReportDocumentHeader
            title={svoReport.title}
            module={filters.module}
            kind={filters.kind}
            reference={svoReport.referenceLabel}
          />
          <Typography>Total da frota ativa: {svoReport.totalActive}</Typography>
          <TableContainer
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}
          >
            <Table size="small" aria-label="Status da frota ativa">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Veículos</TableCell>
                  <TableCell align="right">Percentual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {svoReport.rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell component="th" scope="row">
                      {row.label}
                    </TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{percentage.format(row.percentage)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
    );
  }
  if (report) {
    const money = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const liters = (value: number) =>
      value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    return (
      <Paper
        component="section"
        variant="outlined"
        className="report-print-preview"
        aria-label="Abastecimentos consultados"
        sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.default', minWidth: 0 }}
      >
        <Stack spacing={2}>
          <ReportDocumentHeader
            title="Abastecimentos"
            module={filters.module}
            kind={filters.kind}
            reference={report.referenceLabel}
            referencePrintOnly
            period={`${formatDate(report.filters.startDate)} a ${formatDate(report.filters.endDate)}`}
            appliedFilters={
              report.filters.vehicleId ? `Veículo ${report.filters.vehicleId}` : undefined
            }
          />
          {stale && (
            <Typography role="status">
              Filtros alterados. Atualize a consulta antes de imprimir. Os dados abaixo pertencem ao
              período aplicado.
            </Typography>
          )}
          {report.items.length === 0 && (
            <Typography role="status">
              Nenhum abastecimento encontrado para o período aplicado.
            </Typography>
          )}
          <TableContainer
            tabIndex={0}
            role="region"
            aria-label="Tabela de resultados"
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}
          >
            <Table size="small" aria-label="Itens de abastecimento">
              <TableHead>
                <TableRow>
                  {['Data', 'Placa', 'Modelo', 'Combustível', 'Litros', 'Preço/litro', 'Valor'].map(
                    (label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.fueledOn)}</TableCell>
                    <TableCell>{item.vehiclePlate}</TableCell>
                    <TableCell>{item.vehicleModel}</TableCell>
                    <TableCell>{item.fuelType}</TableCell>
                    <TableCell>{liters(item.liters)}</TableCell>
                    <TableCell>{money(item.pricePerLiter)}</TableCell>
                    <TableCell>{money(item.totalValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography>Total de abastecimentos: {report.totals.totalFuelings}</Typography>
          <Typography>Total de litros: {liters(report.totals.totalLiters)}</Typography>
          <Typography>Valor total: {money(report.totals.totalValue)}</Typography>
        </Stack>
      </Paper>
    );
  }
  const valid = Object.keys(validateReportFilters(filters)).length === 0;
  const indicator = getSvoIndicator(filters);
  return (
    <Paper
      component="section"
      variant="outlined"
      className="report-print-preview"
      aria-labelledby="report-preview-title"
      sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.default' }}
    >
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" id="report-preview-title" sx={{ fontWeight: 700 }}>
          Prévia dos resultados
        </Typography>
        <Typography>Módulo: {moduleLabels[filters.module]}</Typography>
        <Typography>Relatório: {getReportLabel(filters)}</Typography>
        {indicator ? (
          <Typography>
            {indicator === 'ongoing-trips'
              ? tripPeriods[filters.tripPeriod ?? 'today']
              : indicator === 'daily-requests'
                ? 'Últimos 7 dias'
                : isSvoOperationIndicator(indicator)
                  ? 'Situação atual'
                  : 'Situação atual da frota'}
          </Typography>
        ) : (
          <Typography>
            Período:{' '}
            {valid
              ? `${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`
              : 'Preencha os filtros válidos.'}
          </Typography>
        )}
        <Typography role="status">
          Relatório indisponível. Nenhum dado real foi consultado nesta etapa.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta prévia apresenta apenas a estrutura para papel. Não é um relatório gerado e não
          contém dados demonstrativos.
        </Typography>
      </Stack>
    </Paper>
  );
}

import { useState, useSyncExternalStore } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Breadcrumbs, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { authToken } from '@/shared/api/auth-token';
import {
  queryFuelings,
  querySvoFleet,
  querySvoGeneral,
  type SvoGeneralReport,
  ReportApiError,
  querySvoOperation,
  type SvoOperationReport,
  downloadSvoFleet,
  type SvoFleetReport,
  downloadFuelings,
  type FuelingReport,
  type ExportFormat,
} from './reports.api';
import { validateReportFilters } from './reports.validation';

import { ReportActions } from './components/ReportActions';
import { ReportFilters } from './components/ReportFilters';
import { SvoGeneralPreview } from './components/SvoGeneralPreview';
import { SvoOperationPreview } from './components/SvoOperationPreview';
import { ReportPreview } from './components/ReportPreview';
import { PageHeading } from '@/shared/components/PageHeading';
import {
  getSvoIndicator,
  isSvoOperationIndicator,
  isSvoGeneral,
  type ReportFilters as Filters,
  type SvoIndicator,
  type SvoOperationIndicator,
} from './reports.types';
import './reports.print.css';

type Result = { token: string | null } & (
  | { indicator: 'fuelings'; report: FuelingReport }
  | { indicator: 'general'; report: SvoGeneralReport }
  | { indicator: Exclude<SvoIndicator, SvoOperationIndicator>; report: SvoFleetReport }
  | { indicator: SvoOperationIndicator; report: SvoOperationReport }
);

export function ReportsPage() {
  const sessionToken = useSyncExternalStore(authToken.subscribe, authToken.get, () => null);
  const [filters, setFilters] = useState<Filters>({
    module: 'fleet',
    kind: 'general',
    indicator: '',
    startDate: '',
    endDate: '',
  });
  const [result, setResult] = useState<Result>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const svoIndicator = getSvoIndicator(filters);
  const generalSelected = isSvoGeneral(filters);
  const fuelingSelected =
    filters.module === 'fleet' && filters.kind === 'individual' && filters.indicator === 'fuelings';
  const supported = fuelingSelected || generalSelected || Boolean(svoIndicator);
  const valid = Object.keys(validateReportFilters(filters)).length === 0;
  const applied = result?.token === sessionToken ? result : undefined;
  const general = generalSelected && applied?.indicator === 'general' ? applied.report : undefined;
  const report = fuelingSelected && applied?.indicator === 'fuelings' ? applied.report : undefined;
  const operation =
    applied?.indicator === svoIndicator && applied && 'columns' in applied.report
      ? applied.report
      : undefined;
  const svoReport =
    applied &&
    applied.indicator !== 'fuelings' &&
    applied.indicator === svoIndicator &&
    'totalActive' in applied.report
      ? applied.report
      : undefined;
  const stale =
    !!report &&
    (filters.startDate !== report.filters.startDate || filters.endDate !== report.filters.endDate);
  const ready =
    valid &&
    (Boolean(svoReport || operation || general) || (!!report && !stale && report.items.length > 0));

  async function consult() {
    setSubmitted(true);
    if (!supported || !valid || busy) return;
    setBusy(true);
    setError('');
    setResult(undefined);
    const token = authToken.get();
    try {
      const next: Result = generalSelected
        ? { indicator: 'general', report: await querySvoGeneral(filters), token }
        : isSvoOperationIndicator(svoIndicator)
          ? {
              indicator: svoIndicator,
              report: await querySvoOperation(svoIndicator, filters),
              token,
            }
          : svoIndicator
            ? { indicator: svoIndicator, report: await querySvoFleet(svoIndicator), token }
            : {
                indicator: 'fuelings',
                report: await queryFuelings({
                  startDate: filters.startDate,
                  endDate: filters.endDate,
                }),
                token,
              };
      if (token === authToken.get()) setResult(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao consultar relatório.');
    } finally {
      setBusy(false);
    }
  }

  async function download(format: ExportFormat) {
    if (!ready || busy) return;
    if (result?.token !== authToken.get()) {
      setResult(undefined);
      setError('A sessão foi alterada. Consulte novamente o relatório.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const snapshot = svoReport ?? operation;
      if (general) await downloadSvoFleet('general', general.snapshotId, format);
      else if (snapshot && svoIndicator)
        await downloadSvoFleet(svoIndicator, snapshot.snapshotId, format);
      else if (report)
        await downloadFuelings(
          { startDate: report.filters.startDate, endDate: report.filters.endDate },
          format,
        );
    } catch (cause) {
      // A failed format can leave the other representations available.
      if (
        !general ||
        (cause instanceof ReportApiError && [401, 403, 404].includes(cause.status ?? 0))
      ) {
        setResult(undefined);
      }
      setError(cause instanceof Error ? cause.message : 'Falha ao baixar relatório.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="reports-page" sx={{ minWidth: 0 }}>
      <Box component="header" className="reports-screen-only">
        <Breadcrumbs aria-label="Localização" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/" variant="body2" underline="hover">
            Início
          </Link>
          <Typography variant="body2" color="text.primary" aria-current="page">
            Relatórios
          </Typography>
        </Breadcrumbs>
        <PageHeading
          title="Relatórios"
          description="Selecione o módulo e o tipo de relatório para consultar."
        />
      </Box>
      <Paper
        variant="outlined"
        className="report-workspace"
        sx={{
          p: { xs: 2, sm: 3, lg: 4 },
          display: 'grid',
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        <Stack
          component="section"
          aria-labelledby="report-filters-title"
          spacing={2.5}
          className="reports-screen-only"
        >
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography
              component="h2"
              variant="subtitle2"
              id="report-filters-title"
              sx={{
                display: 'inline-block',
                pb: 1.25,
                fontWeight: 700,
                color: 'primary.main',
                borderBottom: '2px solid',
                mb: '-1px',
              }}
            >
              Configurar relatório
            </Typography>
          </Box>
          <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <ReportFilters
              value={filters}
              onChange={(next) => {
                if (
                  next.module !== filters.module ||
                  next.kind !== filters.kind ||
                  next.indicator !== filters.indicator ||
                  next.tripPeriod !== filters.tripPeriod ||
                  next.sectorId !== filters.sectorId
                ) {
                  setResult(undefined);
                  setError('');
                  setSubmitted(false);
                }
                setFilters(next);
              }}
              submitted={submitted}
            />
          </Box>
          {supported && (
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => void consult()}
              sx={{ alignSelf: { sm: 'flex-start' } }}
            >
              {busy
                ? 'Processando…'
                : generalSelected || isSvoOperationIndicator(svoIndicator)
                  ? 'Consultar relatório'
                  : svoIndicator
                    ? 'Consultar situação atual'
                    : 'Consultar abastecimentos'}
            </Button>
          )}
          {busy && <Typography role="status">Aguarde a resposta do backend.</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
        <Stack
          spacing={2}
          sx={{
            minWidth: 0,
            gridColumn:
              generalSelected || (operation && svoIndicator === 'ongoing-trips')
                ? '1 / -1'
                : undefined,
          }}
        >
          {general ? (
            <SvoGeneralPreview report={general} />
          ) : generalSelected ? (
            <Alert severity="info" variant="outlined" className="reports-screen-only">
              Consulte o relatório geral para visualizar os oito painéis.
            </Alert>
          ) : operation ? (
            <SvoOperationPreview report={operation} indicator={svoIndicator} />
          ) : (
            <ReportPreview filters={filters} report={report} svoReport={svoReport} stale={stale} />
          )}
          {!generalSelected && !report && !svoReport && !operation && (
            <Alert severity="info" variant="outlined" className="reports-screen-only">
              {filters.module === 'svo'
                ? svoIndicator
                  ? 'Consulte a situação atual para visualizar os resultados.'
                  : 'Selecione um relatório individual do SVO para consultar.'
                : supported
                  ? 'Selecione o período e consulte os abastecimentos para visualizar os resultados.'
                  : 'Os relatórios dos dashboards ainda estão em preparação. A consulta existente de Abastecimentos está disponível em Individual.'}
            </Alert>
          )}
        </Stack>
      </Paper>
      <Box className="reports-screen-only" sx={{ mt: 2 }}>
        <ReportActions
          ready={ready}
          busy={busy}
          sharedSnapshot={Boolean(svoReport || operation || general)}
          onPdf={() => void download('pdf')}
          onExcel={() => void download('excel')}
          onPrint={() => {
            if (result?.token !== authToken.get()) {
              setResult(undefined);
              setError('A sessão foi alterada. Consulte novamente o relatório.');
              return;
            }
            if (ready && !busy) window.print();
          }}
        />
      </Box>
    </Box>
  );
}

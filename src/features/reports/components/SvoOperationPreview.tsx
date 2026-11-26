import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { SvoOperationReport } from '../reports.api';
import type { SvoIndicator } from '../reports.types';
import { ReportDocumentHeader } from './ReportDocumentHeader';

const emptyMessages: Partial<Record<SvoIndicator, string>> = {
  'vehicle-consumption': 'Sem registros de consumo.',
  'recent-fuelings': 'Sem abastecimentos registrados.',
  'maintenance-alerts': 'Nenhum alerta de manutenção.',
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function displayCell(indicator: SvoIndicator | undefined, column: number, value: string) {
  if (indicator === 'recent-fuelings' && column === 3 && value !== '—') {
    return currency.format(Number(value.replace(',', '.')));
  }
  return value;
}

export function SvoOperationPreview({
  report,
  indicator,
}: {
  report: SvoOperationReport;
  indicator?: SvoIndicator;
}) {
  return (
    <Paper
      component="section"
      variant="outlined"
      className="report-print-preview"
      aria-label={report.title}
      sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.default', minWidth: 0 }}
    >
      <Stack spacing={2}>
        <ReportDocumentHeader
          title={report.title}
          module="svo"
          kind="individual"
          reference={report.referenceLabel}
        />
        <SvoSectionContents section={report} indicator={indicator} />
      </Stack>
    </Paper>
  );
}

export function SvoSectionContents({
  section,
  indicator,
}: {
  section: Pick<SvoOperationReport, 'title' | 'context' | 'columns' | 'rows'>;
  indicator?: SvoIndicator;
}) {
  const wideTable = indicator === 'ongoing-trips';
  return (
    <>
      <Typography>{section.context}</Typography>
      {section.rows.length === 0 ? (
        <Typography role="status">
          {(indicator && emptyMessages[indicator]) ??
            'Nenhuma viagem aberta para os filtros selecionados.'}
        </Typography>
      ) : (
        <TableContainer
          tabIndex={0}
          role="region"
          aria-label="Tabela de resultados"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}
        >
          <Table
            size="small"
            aria-label={section.title}
            sx={
              wideTable
                ? {
                    '@media screen': {
                      minWidth: 720,
                      '& th:first-of-type, & th:last-of-type, & td:first-of-type, & td:nth-of-type(5), & td:last-of-type':
                        { whiteSpace: 'nowrap' },
                    },
                  }
                : indicator === 'recent-fuelings'
                  ? {
                      '@media screen': {
                        minWidth: 380,
                        '& td:nth-of-type(n+2)': { whiteSpace: 'nowrap' },
                      },
                    }
                  : indicator === 'maintenance-alerts'
                    ? { '& td': { overflowWrap: 'anywhere' } }
                    : undefined
            }
          >
            <TableHead>
              <TableRow>
                {section.columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {section.rows.map((row, index) => (
                <TableRow key={index}>
                  {row.map((value, cell) => (
                    <TableCell key={section.columns[cell]}>
                      {displayCell(indicator, cell, value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

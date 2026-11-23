import { Paper, Stack, Typography } from '@mui/material';
import type { SvoGeneralReport } from '../reports.api';
import { ReportDocumentHeader } from './ReportDocumentHeader';
import { SvoSectionContents } from './SvoOperationPreview';

export function SvoGeneralPreview({ report }: { report: SvoGeneralReport }) {
  return (
    <Paper
      component="section"
      variant="outlined"
      className="report-print-preview report-general-preview"
      aria-label={report.title}
      sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.default', minWidth: 0 }}
    >
      <Stack spacing={3}>
        <ReportDocumentHeader
          title={report.title}
          module="svo"
          kind="general"
          reference={report.referenceLabel}
        />
        {report.sections.map((section) => (
          <Stack
            component="section"
            className="report-general-section"
            aria-label={section.title}
            spacing={1}
            key={section.indicator}
            sx={{ minWidth: 0 }}
          >
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ fontWeight: 700, breakAfter: 'avoid' }}
            >
              {section.title}
            </Typography>
            <SvoSectionContents section={section} indicator={section.indicator} />
          </Stack>
        ))}
        <Typography component="footer" variant="body2" className="reports-print-only">
          FSPH · Sistema de Gestão de Frotas
        </Typography>
      </Stack>
    </Paper>
  );
}

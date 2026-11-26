import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { readResponse } from '@/features/auth/api';
import { apiRequest } from '@/shared/api/client';
import { useSession } from '@/features/auth/useSession';
import { Stack, TextField, Typography } from '@mui/material';

import {
  getIndicators,
  getSvoIndicator,
  isSvoGeneral,
  isSvoOperationIndicator,
  tripPeriods,
  type TripPeriod,
  type ReportFilters as Filters,
} from '../reports.types';
import { validateReportFilters } from '../reports.validation';

export function ReportFilters({
  value,
  onChange,
  submitted = false,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  submitted?: boolean;
}) {
  const [touched, setTouched] = useState({ startDate: false, endDate: false });
  const errors = validateReportFilters(value);
  const startDateError = touched.startDate || submitted ? errors.startDate : undefined;
  const endDateError = touched.endDate || submitted ? errors.endDate : undefined;
  const indicators = getIndicators(value.module);
  const indicator = getSvoIndicator(value);
  const { data: user } = useSession();
  const ongoing = indicator === 'ongoing-trips' || isSvoGeneral(value);
  const sectors = useQuery({
    queryKey: ['reports', 'sectors', user?.id, user?.sectorId],
    queryFn: async ({ signal }) =>
      readResponse<{ id: string; name: string }[]>(await apiRequest('/api/v1/sectors', { signal })),
    enabled: ongoing && Boolean(user?.permissions.includes('SECTORS_READ')),
  });
  return (
    <Stack
      spacing={2.5}
      sx={{
        '& .MuiInputLabel-root': {
          position: 'static',
          transform: 'none',
          maxWidth: '100%',
          fontSize: '0.875rem',
          fontWeight: 600,
          mb: 0.75,
        },
        '& .MuiInputLabel-root:not(.Mui-error, .Mui-disabled)': { color: 'text.primary' },
        '& .MuiOutlinedInput-root': { minWidth: 0, fontSize: '0.875rem', borderRadius: '6px' },
        '& .MuiOutlinedInput-input': { minHeight: '1.25rem', py: 1.5, px: 1.75 },
        '& .MuiOutlinedInput-notchedOutline': { top: 0, borderColor: 'divider' },
        '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
        '& .MuiFormControl-root': { minWidth: 0 },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          fullWidth
          label="Módulo"
          value={value.module}
          slotProps={{ select: { native: true } }}
          onChange={(event) =>
            onChange({ ...value, module: event.target.value as Filters['module'], indicator: '' })
          }
        >
          <option value="fleet">Gestão de Frotas</option>
          <option value="svo">SVO</option>
        </TextField>
        <TextField
          select
          fullWidth
          label="Tipo"
          value={value.kind}
          slotProps={{ select: { native: true } }}
          onChange={(event) =>
            onChange({ ...value, kind: event.target.value as Filters['kind'], indicator: '' })
          }
        >
          <option value="general">Geral</option>
          <option value="individual">Individual</option>
        </TextField>
      </Stack>
      {value.kind === 'individual' && (
        <TextField
          select
          fullWidth
          label="Relatório individual"
          value={value.indicator}
          error={!!errors.indicator}
          helperText={
            errors.indicator ??
            (indicator && !isSvoOperationIndicator(indicator)
              ? 'Situação atual da frota.'
              : undefined)
          }
          slotProps={{
            select: { native: true },
            inputLabel: { shrink: true },
            input: { notched: true },
          }}
          onChange={(event) => onChange({ ...value, indicator: event.target.value })}
        >
          <option value="">Selecione um relatório</option>
          {indicators.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </TextField>
      )}
      {isSvoGeneral(value) && (
        <Typography variant="subtitle2">Filtros de viagens em andamento</Typography>
      )}
      {ongoing && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            fullWidth
            label="Setor"
            value={value.sectorId ?? ''}
            slotProps={{ select: { native: true } }}
            disabled={!sectors.data}
            error={sectors.isError}
            helperText={sectors.isError ? 'Falha ao carregar os setores.' : undefined}
            onChange={(event) => onChange({ ...value, sectorId: event.target.value })}
          >
            <option value="">Todos os setores</option>
            {sectors.data?.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Período"
            value={value.tripPeriod ?? 'today'}
            slotProps={{ select: { native: true } }}
            onChange={(event) =>
              onChange({ ...value, tripPeriod: event.target.value as TripPeriod })
            }
          >
            {Object.entries(tripPeriods).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </TextField>
        </Stack>
      )}
      {!indicator && !ongoing && (
        <Stack spacing={2} role="group" aria-labelledby="report-period-title">
          <Typography id="report-period-title" variant="subtitle2" sx={{ fontWeight: 700 }}>
            Período
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Data inicial"
              value={value.startDate}
              error={!!startDateError}
              helperText={startDateError}
              slotProps={{ inputLabel: { shrink: true } }}
              onBlur={() => setTouched((previous) => ({ ...previous, startDate: true }))}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, startDate: true }));
                onChange({ ...value, startDate: event.target.value });
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Data final"
              value={value.endDate}
              error={!!endDateError}
              helperText={endDateError}
              slotProps={{ inputLabel: { shrink: true } }}
              onBlur={() => setTouched((previous) => ({ ...previous, endDate: true }))}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, endDate: true }));
                onChange({ ...value, endDate: event.target.value });
              }}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

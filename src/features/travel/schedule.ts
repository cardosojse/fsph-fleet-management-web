import type { Dto } from '@/shared/api/types';
import type { Field, FormValues } from '@/shared/components/FormDialog';

export const scheduleFields: Field[] = [
  { name: 'plannedStartAt', label: 'Saída prevista', type: 'datetime-local', required: true },
  {
    name: 'plannedDurationMinutes',
    label: 'Duração prevista (minutos)',
    type: 'number',
    min: 1,
    required: true,
  },
];
export const scheduleBody = (values: FormValues): Dto['UpdateRouteScheduleRequest'] => ({
  plannedStartAt: new Date(values.plannedStartAt!).toISOString(),
  plannedDurationMinutes: Number(values.plannedDurationMinutes),
});

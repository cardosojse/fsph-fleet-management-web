export function dateTime(value: string | null | undefined): string {
  return value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value),
      )
    : '—';
}
export function localDate(value: string | null | undefined): string {
  return value ? value.split('-').reverse().join('/') : '—';
}
export function dateTimeInput(value: string): string {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
export const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  ASSIGNED: 'Vinculado a viagem',
  PLANNED: 'Planejada',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  ACTIVE: 'Vigente',
  REPLACED: 'Substituído',
};

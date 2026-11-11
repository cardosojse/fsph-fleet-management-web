import { useQueryClient } from '@tanstack/react-query';
import { invalidateData } from '@/shared/api/invalidate';
import { FormDialog, type FormSpec } from './FormDialog';

export function ActionForm({ form, onClose }: { form: FormSpec | null; onClose: () => void }) {
  const client = useQueryClient();
  return (
    form && (
      <FormDialog
        title={form.title}
        fields={form.fields}
        defaults={form.defaults}
        onClose={onClose}
        onSubmit={async (values) => {
          await form.submit(values);
          await invalidateData(client);
        }}
      />
    )
  );
}

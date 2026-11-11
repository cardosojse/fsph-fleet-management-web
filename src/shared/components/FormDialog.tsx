import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { ApiError } from '@/shared/api/result';
import { ApiFeedback } from './ApiFeedback';

export type FormValues = Record<string, string>;
export type FormSpec = {
  title: string;
  fields: Field[];
  defaults?: FormValues;
  submit: (values: FormValues) => Promise<unknown>;
};
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';
  required?: boolean;
  min?: number;
  minLength?: number;
  maxLength?: number;
  helper?: string;
  options?: { value: string; label: string }[];
};

export function FormDialog({
  title,
  fields,
  defaults,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: Field[];
  defaults?: FormValues;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<unknown>;
}) {
  const [error, setError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: defaults });
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (failure) {
      setError(failure);
      if (failure instanceof ApiError) {
        failure.problem.violations?.forEach(({ field, message }) => {
          if (fields.some((entry) => entry.name === field)) setFieldError(field, { message });
        });
      }
    }
  });
  return (
    <Dialog
      open
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <ApiFeedback error={error} />
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type ?? 'text'}
                select={Boolean(field.options)}
                defaultValue={defaults?.[field.name] ?? ''}
                disabled={isSubmitting}
                fullWidth
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.message ?? field.helper}
                slotProps={{
                  inputLabel: {
                    shrink:
                      field.type === 'date' || field.type === 'datetime-local' ? true : undefined,
                  },
                  htmlInput: {
                    min: field.min,
                    step: field.type === 'number' ? 1 : undefined,
                    maxLength: field.maxLength,
                    autoComplete: field.type === 'password' ? 'new-password' : undefined,
                  },
                }}
                {...register(field.name, {
                  required: field.required ? 'Preencha este campo.' : false,
                  minLength: field.minLength
                    ? {
                        value: field.minLength,
                        message: `Use pelo menos ${field.minLength} caracteres.`,
                      }
                    : undefined,
                  maxLength: field.maxLength
                    ? { value: field.maxLength, message: `Use até ${field.maxLength} caracteres.` }
                    : undefined,
                  validate: (value) => {
                    if (field.required && !value?.trim()) return 'Preencha este campo.';
                    if (
                      value &&
                      field.type === 'number' &&
                      (!Number.isSafeInteger(Number(value)) ||
                        (field.min !== undefined && Number(value) < field.min))
                    )
                      return `Informe um número inteiro${field.min !== undefined ? ` a partir de ${field.min}` : ''}.`;
                    if (
                      value &&
                      field.type === 'datetime-local' &&
                      !Number.isFinite(new Date(value).getTime())
                    )
                      return 'Informe uma data válida.';
                    return true;
                  },
                })}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button disabled={isSubmitting} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

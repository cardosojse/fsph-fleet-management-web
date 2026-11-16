import { z } from 'zod';

export const normalizeCardNumber = (value: string) => value.replace(/[\s-]/g, '');
export const maskCardNumber = (value: string) => `•••• ${value.slice(-4)}`;

/** Restrições provisórias para a demonstração, não regras do backend. */
export const fuelCardSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, 'Informe o número do cartão.')
    .refine(
      (value) => /^[\d\s-]+$/.test(value) && /^\d{8,19}$/.test(normalizeCardNumber(value)),
      'Use de 8 a 19 dígitos. Espaços e hífens são permitidos.',
    ),
  limit: z
    .string()
    .trim()
    .regex(/^\d+(?:[,.]\d{1,2})?$/, 'Informe um valor como 1500,00, sem separador de milhar.')
    .refine((value) => {
      const amount = Number(value.replace(',', '.'));
      return Number.isFinite(amount) && amount > 0 && amount <= Number.MAX_SAFE_INTEGER / 100;
    }, 'Informe um limite maior que zero e dentro de um valor representável.'),
  validity: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Informe mês e ano válidos.')
    .refine((value) => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return value >= month && !value.startsWith('0000');
    }, 'Use o mês atual ou um mês futuro nesta demonstração.'),
});

export type FuelCardFormValues = z.infer<typeof fuelCardSchema>;
export const fuelCardEditSchema = fuelCardSchema.extend({
  number: fuelCardSchema.shape.number.or(z.literal('')),
});

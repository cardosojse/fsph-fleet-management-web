import { z } from 'zod';

const violationSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const problemDetailSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().optional(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().optional(),
  violations: z.array(violationSchema).optional(),
});

export type ApiProblem = z.infer<typeof problemDetailSchema>;

export function parseProblemDetail(value: unknown): ApiProblem {
  const result = problemDetailSchema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  return {
    title: 'Erro inesperado',
    detail: 'Não foi possível concluir a operação.',
    code: 'UNKNOWN_ERROR',
  };
}

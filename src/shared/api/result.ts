import { parseProblemDetail, type ApiProblem } from '@/shared/api/problem-detail';

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ApiProblem;

  constructor(status: number, body: unknown) {
    const problem = parseProblemDetail(body);
    const fallback =
      status === 403
        ? 'Seu perfil não tem permissão para esta operação.'
        : status === 401
          ? 'Sessão expirada ou credenciais inválidas. Entre novamente.'
          : 'Não foi possível concluir a operação.';
    super(problem.detail ?? problem.title ?? fallback);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
}

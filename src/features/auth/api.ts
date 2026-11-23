import { apiRequest } from '@/shared/api/client';
import { ApiError } from '@/shared/api/result';

export type LoginCredentials = { email: string; password: string };
export type Session = {
  id: string;
  name: string;
  role: string;
  sectorId: string | null;
  permissions: string[];
};

export async function readResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

export const authApi = {
  async login(credentials: LoginCredentials) {
    return readResponse<{ accessToken: string }>(
      await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }),
    );
  },
  async me(signal?: AbortSignal) {
    return readResponse<Session>(await apiRequest('/api/v1/auth/me', { signal }));
  },
  async logout() {
    const response = await apiRequest('/api/v1/auth/logout', { method: 'POST' });
    if (!response.ok) await readResponse(response);
  },
};

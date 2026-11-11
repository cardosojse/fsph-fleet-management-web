import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().trim().min(1).optional(),
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_APP_ENV: z.enum(['production', 'staging', 'development']).default('production'),
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  apiBaseUrl: (parsedEnv.VITE_API_URL ?? parsedEnv.VITE_API_BASE_URL).replace(/\/+$/, ''),
  isStaging: parsedEnv.VITE_APP_ENV === 'staging',
} as const;

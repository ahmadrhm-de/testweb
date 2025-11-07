import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('file:./dev.db'),
  ADMIN_PASSWORD: z.string().default('salonnova-admin'),
  EMAIL_FROM: z.string().default('SalonNova <noreply@salonnova.local>'),
  RATE_LIMIT_MAX: z.coerce.number().default(20),
  RATE_LIMIT_WINDOW_MIN: z.coerce.number().default(5)
});

export const env = envSchema.parse(process.env);

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  MONGODB_URI: z
    .string()
    .default('mongodb://127.0.0.1:27017/groundops'),
  JWT_ACCESS_SECRET: z.string().default('groundops_super_secret_access_jwt_key_2026!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('groundops_super_secret_refresh_jwt_key_2026!'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  INVITATION_TOKEN_EXPIRES_HOURS: z.coerce.number().default(48),
  
  // Email / SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('GroundOps <no-reply@groundops.internal>'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Initial Admin Seed Defaults
  INITIAL_ORG_NAME: z.string().default('GroundOps Facilities Pvt Ltd'),
  INITIAL_ORG_CODE: z.string().default('GRO001'),
  INITIAL_ORG_EMAIL: z.string().default('admin@groundops.internal'),
  INITIAL_ADMIN_NAME: z.string().default('System Administrator'),
  INITIAL_ADMIN_EMAIL: z.string().default('admin@groundops.internal'),
  INITIAL_ADMIN_PASSWORD: z.string().default('Admin@12345'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export const env: EnvConfig = EnvSchema.parse(process.env);

import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),

  LLM_PROVIDER: z.enum(['anthropic', 'google', 'mock']).default('google'),
  LLM_MODEL: z.string().default('gemini-2.0-flash'),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().default(120),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([k, v]) => `${k}: ${v?.join(', ')}`)
      .join('; ');
    throw new Error(`Invalid configuration: ${message}`);
  }
  return result.data;
}

export const config = loadConfig();

export function getAllowedOrigins(): string[] {
  return config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
}

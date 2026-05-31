import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { clerkMiddleware } from '@clerk/express';
import { getAllowedOrigins } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { v1Router } from './routes/v1';

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — driven by ALLOWED_ORIGINS env var
  app.use(
    cors({
      origin: getAllowedOrigins(),
      credentials: true,
    }),
  );

  // Rate limiting
  const rateLimitPerMinute = parseInt(process.env['RATE_LIMIT_PER_MINUTE'] ?? '120', 10);
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: rateLimitPerMinute,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging with PHI-redacted child loggers
  app.use(requestLogger);

  // Clerk middleware — makes auth available everywhere; requireAuth enforces it per-route
  app.use(clerkMiddleware());

  // Health endpoints (no auth required)
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/readyz', (_req, res) => {
    res.json({ status: 'ok', checks: { db: 'unchecked', queue: 'unchecked' } });
  });

  // OpenAPI docs served at /docs
  const openapiPath = path.join(process.cwd(), 'openapi.yaml');
  if (fs.existsSync(openapiPath)) {
    const spec = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as Record<string, unknown>;
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  }

  // Versioned API
  app.use('/v1', v1Router);

  // Centralized error handler — must be last
  app.use(errorHandler);

  return app;
}

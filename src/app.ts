import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getAllowedOrigins } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

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

  // Health endpoints (no auth required)
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/readyz', (_req, res) => {
    // Phase 6 will add actual DB + queue connectivity checks
    res.json({ status: 'ok', checks: { db: 'unchecked', queue: 'unchecked' } });
  });

  // API routes mounted in Phase 5
  // app.use('/v1', v1Router);

  // Centralized error handler — must be last
  app.use(errorHandler);

  return app;
}

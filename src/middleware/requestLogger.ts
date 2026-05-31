import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      log: typeof logger;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
  req.requestId = requestId;
  req.log = logger.child({ requestId });

  res.setHeader('x-request-id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    req.log.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      },
      'request completed',
    );
  });

  next();
}

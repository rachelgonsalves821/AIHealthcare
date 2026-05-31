import pino from 'pino';
import type { IncomingMessage, ServerResponse } from 'http';

// PHI fields that must never appear in logs
const PHI_FIELDS = [
  'mrn', 'externalMrnHash', 'dateOfBirth', 'dob', 'ssn', 'address',
  'phone', 'firstName', 'lastName', 'patientName', 'memberName',
  'email',
];

function redactPhi(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PHI_FIELDS.some((f) => k.toLowerCase().includes(f.toLowerCase()))) {
      redacted[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      redacted[k] = redactPhi(v);
    } else {
      redacted[k] = v;
    }
  }
  return redacted;
}

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  redact: {
    paths: PHI_FIELDS.map((f) => `*.${f}`),
    censor: '[REDACTED]',
  },
  serializers: {
    req(req: IncomingMessage & { id?: string }) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.socket?.remoteAddress,
      };
    },
    res(res: ServerResponse) {
      return { statusCode: res.statusCode };
    },
    err: pino.stdSerializers.err,
    body: (body: unknown) => redactPhi(body),
  },
});

export { redactPhi };
export type Logger = typeof logger;

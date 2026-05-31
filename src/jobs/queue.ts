// eslint-disable-next-line @typescript-eslint/no-require-imports
const PgBoss = require('pg-boss');
import { logger } from '../lib/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bossInstance: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getQueue(): Promise<any> {
  if (bossInstance) return bossInstance;
  const connectionString = process.env['DATABASE_URL'] ?? '';
  bossInstance = new PgBoss(connectionString);
  bossInstance.on('error', (err: Error) => logger.error({ err }, 'pg-boss error'));
  await bossInstance.start();
  logger.info('pg-boss queue started');
  return bossInstance;
}

export async function stopQueue(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop();
    bossInstance = null;
  }
}

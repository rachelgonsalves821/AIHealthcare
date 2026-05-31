import { logger } from '../../lib/logger';
import type { CriteriaRefreshPayload } from '../definitions';

/**
 * TODO: Implement automated payer-criteria change tracking.
 * See docs/decisions/0004-criteria-refresh.md for design notes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleCriteriaRefresh(job: any): Promise<void> {
  const { payerId } = job.data as CriteriaRefreshPayload;
  logger.info({ jobId: job.id, payerId }, 'criteria.refresh: no-op stub');
}

import { Appeal, AppealStatus, Prisma } from '@prisma/client';
import { SignOffRequiredError, ForbiddenError, ConflictError } from '../../lib/errors';
import * as repo from './appealRepository';
import * as caseRepo from '../cases/caseRepository';
import { enqueueAppealDraft as enqueueJob } from '../../jobs/enqueue';
import { writeAuditLog } from '../audit/auditRepository';

export async function getAppealById(id: string): Promise<Appeal> {
  return repo.getAppealById(id);
}

export async function getAppealsByCaseId(caseId: string): Promise<Appeal[]> {
  return repo.getAppealsByCaseId(caseId);
}

export async function enqueueAppealDraft(
  caseId: string,
  orgId: string,
  requestedByUserId = 'system',
): Promise<string> {
  await caseRepo.getCaseById(caseId, orgId);
  const jobId = await enqueueJob({ caseId, orgId, requestedByUserId });
  return jobId ?? `appeal.draft:${caseId}`;
}

export async function signOffAppeal(
  id: string,
  clinicianUserId: string,
  orgId: string,
  ipAddress?: string,
): Promise<Appeal> {
  const appeal = await repo.getAppealById(id);
  if (appeal.status !== AppealStatus.AWAITING_SIGNOFF && appeal.status !== AppealStatus.DRAFT) {
    throw new ConflictError(`Appeal is already in status '${appeal.status}' — cannot sign off`);
  }
  const updated = await repo.signOffAppeal(id, clinicianUserId);
  await writeAuditLog({
    orgId,
    actorUserId: clinicianUserId,
    action: 'appeal.signed_off',
    entityType: 'Appeal',
    entityId: id,
    ipAddress,
  });
  return updated;
}

/**
 * Submit an appeal.
 * Hard constraint: clinicianSignoffUserId and signedOffAt MUST be set.
 * This is enforced here in the service layer AND via a DB CHECK constraint.
 */
export async function submitAppeal(
  id: string,
  orgId: string,
  actorUserId: string,
  ipAddress?: string,
): Promise<Appeal> {
  const appeal = await repo.getAppealById(id);

  if (!appeal.clinicianSignoffUserId || !appeal.signedOffAt) {
    throw new SignOffRequiredError();
  }

  if (appeal.status !== AppealStatus.SIGNED) {
    throw new ForbiddenError(`Appeal must be in SIGNED status before submission (current: ${appeal.status})`);
  }

  const updated = await repo.submitAppeal(id);
  await writeAuditLog({
    orgId,
    actorUserId,
    action: 'appeal.submitted',
    entityType: 'Appeal',
    entityId: id,
    metadata: { caseId: appeal.caseId } as Prisma.InputJsonObject,
    ipAddress,
  });
  return updated;
}

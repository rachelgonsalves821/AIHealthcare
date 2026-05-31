import { Outcome, OutcomeResolution, Prisma } from '@prisma/client';
import * as repo from './outcomeRepository';
import * as caseRepo from '../cases/caseRepository';
import * as caseSvc from '../cases/caseService';
import { writeAuditLog } from '../audit/auditRepository';
import { CaseStatus } from '@prisma/client';

export async function recordOutcome(
  caseId: string,
  orgId: string,
  input: {
    payerId: string;
    denialReason?: string;
    resolution: OutcomeResolution | string;
    recoveredValueCents?: number;
  },
  actorUserId: string,
  ipAddress?: string,
): Promise<Outcome> {
  await caseRepo.getCaseById(caseId, orgId);
  const outcome = await repo.createOutcome({
    caseId,
    payerId: input.payerId,
    denialReason: input.denialReason,
    resolution: input.resolution as OutcomeResolution,
    recoveredValueCents: input.recoveredValueCents,
  });
  await caseSvc.transitionStatus(caseId, orgId, CaseStatus.RESOLVED, actorUserId, ipAddress);
  await writeAuditLog({
    orgId,
    actorUserId,
    action: 'outcome.recorded',
    entityType: 'Outcome',
    entityId: outcome.id,
    metadata: { resolution: input.resolution, recoveredValueCents: input.recoveredValueCents } as Prisma.InputJsonObject,
    ipAddress,
  });
  return outcome;
}

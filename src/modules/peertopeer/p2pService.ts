import { PeerToPeer, P2POutcome } from '@prisma/client';
import { Prisma } from '@prisma/client';
import * as repo from './p2pRepository';
import * as caseRepo from '../cases/caseRepository';
import * as caseSvc from '../cases/caseService';
import { writeAuditLog } from '../audit/auditRepository';
import { CaseStatus } from '@prisma/client';

export async function scheduleP2P(
  caseId: string,
  orgId: string,
  input: {
    reviewingPhysicianId: string;
    scheduledAt: Date;
    payerReviewerName?: string;
    prepPackRef?: string;
  },
  actorUserId: string,
  ipAddress?: string,
): Promise<PeerToPeer> {
  await caseRepo.getCaseById(caseId, orgId);
  const p2p = await repo.createP2P({ caseId, ...input });
  await caseSvc.transitionStatus(caseId, orgId, CaseStatus.P2P_SCHEDULED, actorUserId, ipAddress);
  await writeAuditLog({
    orgId,
    actorUserId,
    action: 'p2p.scheduled',
    entityType: 'PeerToPeer',
    entityId: p2p.id,
    metadata: { caseId } as Prisma.InputJsonObject,
    ipAddress,
  });
  return p2p;
}

export async function recordP2POutcome(
  p2pId: string,
  orgId: string,
  outcome: P2POutcome,
  actorUserId: string,
  notes?: string,
  ipAddress?: string,
): Promise<PeerToPeer> {
  const p2p = await repo.getP2PById(p2pId);
  const updated = await repo.updateP2POutcome(p2pId, outcome, notes);
  await writeAuditLog({
    orgId,
    actorUserId,
    action: 'p2p.outcome_recorded',
    entityType: 'PeerToPeer',
    entityId: p2pId,
    metadata: { outcome, caseId: p2p.caseId } as Prisma.InputJsonObject,
    ipAddress,
  });
  return updated;
}

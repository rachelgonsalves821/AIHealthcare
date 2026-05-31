import { Case, CaseStatus, Prisma } from '@prisma/client';
import { assertValidTransition } from './stateMachine';
import * as repo from './caseRepository';
import { writeAuditLog } from '../audit/auditRepository';
import type { CreateCaseInput, ListCasesFilter } from './caseRepository';

export async function createCase(
  input: CreateCaseInput,
  actorUserId: string,
  ipAddress?: string,
): Promise<Case> {
  const c = await repo.createCase(input);
  await writeAuditLog({
    orgId: input.orgId,
    actorUserId,
    action: 'case.created',
    entityType: 'Case',
    entityId: c.id,
    metadata: { source: input.source, caseType: input.caseType } as Prisma.InputJsonObject,
    ipAddress,
  });
  return c;
}

export async function listCases(filter: ListCasesFilter): Promise<Case[]> {
  return repo.listCases(filter);
}

export async function getCaseById(id: string, orgId: string): Promise<Case> {
  return repo.getCaseById(id, orgId);
}

export async function transitionStatus(
  id: string,
  orgId: string,
  to: CaseStatus,
  actorUserId: string,
  ipAddress?: string,
): Promise<Case> {
  const c = await repo.getCaseById(id, orgId);
  assertValidTransition(c.status, to);
  const updated = await repo.updateCaseStatus(id, orgId, to);
  await writeAuditLog({
    orgId,
    actorUserId,
    action: 'case.status_changed',
    entityType: 'Case',
    entityId: id,
    metadata: { from: c.status, to } as Prisma.InputJsonObject,
    ipAddress,
  });
  return updated;
}

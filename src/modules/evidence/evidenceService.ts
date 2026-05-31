import { EvidencePack } from '@prisma/client';
import * as repo from './evidenceRepository';
import * as caseRepo from '../cases/caseRepository';
import { NotFoundError } from '../../lib/errors';

/**
 * Enqueues evidence generation job (Phase 6 wires the actual pg-boss job).
 * Returns a job reference string.
 */
export async function enqueueEvidenceGeneration(caseId: string, orgId: string): Promise<string> {
  await caseRepo.getCaseById(caseId, orgId); // validates access
  // Real job enqueue wired in Phase 6
  return `evidence.generate:${caseId}`;
}

export async function getEvidenceForCase(caseId: string, orgId: string): Promise<EvidencePack[]> {
  await caseRepo.getCaseById(caseId, orgId);
  return repo.getEvidencePacksByCaseId(caseId);
}

export async function getEvidencePackById(id: string): Promise<EvidencePack> {
  const pack = await repo.getEvidencePackById(id);
  if (!pack) throw new NotFoundError('EvidencePack', id);
  return pack;
}

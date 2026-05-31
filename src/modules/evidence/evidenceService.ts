import { EvidencePack } from '@prisma/client';
import * as repo from './evidenceRepository';
import * as caseRepo from '../cases/caseRepository';
import { enqueueEvidenceGenerate } from '../../jobs/enqueue';
import { NotFoundError } from '../../lib/errors';

export async function enqueueEvidenceGeneration(
  caseId: string,
  orgId: string,
  requestedByUserId = 'system',
): Promise<string> {
  await caseRepo.getCaseById(caseId, orgId);
  const jobId = await enqueueEvidenceGenerate({ caseId, orgId, requestedByUserId });
  return jobId ?? `evidence.generate:${caseId}`;
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

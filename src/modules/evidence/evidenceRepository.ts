import { EvidencePack, EvidencePackStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export async function createEvidencePack(input: {
  caseId: string;
  generatedByUserId?: string;
  clinicalEvidence: Prisma.InputJsonObject;
  citedCriteria: Prisma.InputJsonValue;
  llmModel: string;
}): Promise<EvidencePack> {
  return prisma.evidencePack.create({ data: input });
}

export async function getEvidencePacksByCaseId(caseId: string): Promise<EvidencePack[]> {
  return prisma.evidencePack.findMany({
    where: { caseId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEvidencePackById(id: string): Promise<EvidencePack> {
  const e = await prisma.evidencePack.findUnique({ where: { id } });
  if (!e) throw new NotFoundError('EvidencePack', id);
  return e;
}

export async function updateEvidencePackStatus(
  id: string,
  status: EvidencePackStatus,
): Promise<EvidencePack> {
  return prisma.evidencePack.update({ where: { id }, data: { status } });
}

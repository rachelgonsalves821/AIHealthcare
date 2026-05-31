import { Appeal, AppealStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export async function createAppeal(input: {
  caseId: string;
  draftContent: string;
  draftedByModel: string;
}): Promise<Appeal> {
  return prisma.appeal.create({
    data: { ...input, status: AppealStatus.AWAITING_SIGNOFF },
  });
}

export async function getAppealById(id: string): Promise<Appeal> {
  const a = await prisma.appeal.findUnique({ where: { id } });
  if (!a) throw new NotFoundError('Appeal', id);
  return a;
}

export async function getAppealsByCaseId(caseId: string): Promise<Appeal[]> {
  return prisma.appeal.findMany({ where: { caseId }, orderBy: { createdAt: 'desc' } });
}

export async function signOffAppeal(
  id: string,
  clinicianSignoffUserId: string,
): Promise<Appeal> {
  return prisma.appeal.update({
    where: { id },
    data: {
      clinicianSignoffUserId,
      signedOffAt: new Date(),
      status: AppealStatus.SIGNED,
    },
  });
}

export async function submitAppeal(id: string): Promise<Appeal> {
  return prisma.appeal.update({
    where: { id },
    data: { status: AppealStatus.SUBMITTED, submittedAt: new Date() },
  });
}

export async function updateAppealStatus(id: string, status: AppealStatus): Promise<Appeal> {
  return prisma.appeal.update({ where: { id }, data: { status } });
}

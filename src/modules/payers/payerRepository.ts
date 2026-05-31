import { Payer, PayerCriteria } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export async function createPayer(input: {
  name: string;
  externalId: string;
  region: string;
}): Promise<Payer> {
  return prisma.payer.create({ data: input });
}

export async function listPayers(): Promise<Payer[]> {
  return prisma.payer.findMany({ orderBy: { name: 'asc' } });
}

export async function getPayerById(id: string): Promise<Payer> {
  const p = await prisma.payer.findUnique({ where: { id } });
  if (!p) throw new NotFoundError('Payer', id);
  return p;
}

export async function getCurrentCriteria(
  payerId: string,
  serviceType?: string,
): Promise<PayerCriteria[]> {
  // Current criteria = criteria not superseded by anyone else
  return prisma.payerCriteria.findMany({
    where: {
      payerId,
      ...(serviceType && { serviceType }),
      supersedes: null, // this criteria is not the superseder of anything
    },
    orderBy: { effectiveDate: 'desc' },
  });
}

export async function getAllCriteriaForPayer(payerId: string): Promise<PayerCriteria[]> {
  return prisma.payerCriteria.findMany({
    where: { payerId },
    orderBy: { effectiveDate: 'desc' },
  });
}

export async function createCriteriaVersion(input: {
  payerId: string;
  serviceType: string;
  region: string;
  criteriaText: string;
  sourceUrl?: string;
  supersededById?: string;
}): Promise<PayerCriteria> {
  const latest = await prisma.payerCriteria.findFirst({
    where: { payerId: input.payerId, serviceType: input.serviceType, region: input.region },
    orderBy: { version: 'desc' },
  });
  const version = (latest?.version ?? 0) + 1;
  return prisma.payerCriteria.create({ data: { ...input, version } });
}

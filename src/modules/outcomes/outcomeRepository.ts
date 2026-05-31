import { Outcome, OutcomeResolution } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function createOutcome(input: {
  caseId: string;
  payerId: string;
  denialReason?: string;
  resolution: OutcomeResolution;
  recoveredValueCents?: number;
}): Promise<Outcome> {
  return prisma.outcome.create({ data: input });
}

export async function getOutcomesByCaseId(caseId: string): Promise<Outcome[]> {
  return prisma.outcome.findMany({
    where: { caseId },
    orderBy: { resolvedAt: 'desc' },
  });
}

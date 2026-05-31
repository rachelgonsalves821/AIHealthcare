import { PeerToPeer, P2POutcome } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export async function createP2P(input: {
  caseId: string;
  reviewingPhysicianId: string;
  scheduledAt: Date;
  payerReviewerName?: string;
  prepPackRef?: string;
}): Promise<PeerToPeer> {
  return prisma.peerToPeer.create({ data: input });
}

export async function getP2PById(id: string): Promise<PeerToPeer> {
  const p = await prisma.peerToPeer.findUnique({ where: { id } });
  if (!p) throw new NotFoundError('PeerToPeer', id);
  return p;
}

export async function getP2PsByCaseId(caseId: string): Promise<PeerToPeer[]> {
  return prisma.peerToPeer.findMany({
    where: { caseId },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function updateP2POutcome(
  id: string,
  outcome: P2POutcome,
  notes?: string,
): Promise<PeerToPeer> {
  return prisma.peerToPeer.update({ where: { id }, data: { outcome, notes } });
}

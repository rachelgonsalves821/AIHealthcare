import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface AuditEntry {
  orgId: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonObject;
  ipAddress?: string;
}

/** Append-only — no update or delete paths exposed. */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      orgId: entry.orgId,
      actorUserId: entry.actorUserId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: (entry.metadata ?? {}) as Prisma.InputJsonObject,
      ipAddress: entry.ipAddress,
    },
  });
}

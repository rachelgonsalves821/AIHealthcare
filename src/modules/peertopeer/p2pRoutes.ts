import { Router } from 'express';
import { z } from 'zod';
import { UserRole, P2POutcome } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import * as svc from './p2pService';

const router = Router();

const UpdateOutcomeSchema = z.object({
  outcome: z.nativeEnum(P2POutcome),
  notes: z.string().optional(),
});

// PATCH /v1/p2p/:id
router.patch('/:id', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF, UserRole.CLINICIAN), async (req, res, next) => {
  try {
    const { outcome, notes } = UpdateOutcomeSchema.parse(req.body);
    const p2p = await svc.recordP2POutcome(
      req.params['id'] as string,
      req.auth!.orgId,
      outcome,
      req.auth!.dbUserId,
      notes,
      req.ip ?? undefined,
    );
    res.json(p2p);
  } catch (err) { next(err); }
});

export { router as p2pRouter };

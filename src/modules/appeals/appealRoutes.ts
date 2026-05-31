import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import * as svc from './appealService';

const router = Router();

// POST /v1/appeals/:id/signoff — CLINICIAN only
router.post('/:id/signoff', requireAuth, userProvisioner, requireRole(UserRole.CLINICIAN), async (req, res, next) => {
  try {
    const appeal = await svc.signOffAppeal(
      req.params['id'] as string,
      req.auth!.dbUserId,
      req.auth!.orgId,
      req.ip ?? undefined,
    );
    res.json(appeal);
  } catch (err) { next(err); }
});

// POST /v1/appeals/:id/submit — rejected if not signed off
router.post('/:id/submit', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF, UserRole.CLINICIAN), async (req, res, next) => {
  try {
    const appeal = await svc.submitAppeal(
      req.params['id'] as string,
      req.auth!.orgId,
      req.auth!.dbUserId,
      req.ip ?? undefined,
    );
    res.json(appeal);
  } catch (err) { next(err); }
});

export { router as appealRouter };

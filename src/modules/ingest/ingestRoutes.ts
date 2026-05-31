import { Router } from 'express';
import { z } from 'zod';
import { UserRole, CaseType, CaseSource } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import * as svc from '../cases/caseService';

const router = Router();

const WebhookSchema = z.object({
  patientId: z.string(),
  payerId: z.string(),
  serviceType: z.string(),
  caseType: z.nativeEnum(CaseType),
  externalRef: z.string().optional(),
  complexityScore: z.number().min(0).max(1).optional(),
});

// POST /v1/ingest/webhook — vendor handoff intake
router.post('/webhook', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF), async (req, res, next) => {
  try {
    const body = WebhookSchema.parse(req.body);
    const c = await svc.createCase(
      { ...body, orgId: req.auth!.orgId, source: CaseSource.VENDOR_HANDOFF },
      req.auth!.dbUserId,
      req.ip,
    );
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
});

export { router as ingestRouter };

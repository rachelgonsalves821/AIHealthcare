import { Router } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import * as repo from './payerRepository';

const router = Router();

const CreatePayerSchema = z.object({
  name: z.string(),
  externalId: z.string(),
  region: z.string(),
});

const CreateCriteriaSchema = z.object({
  serviceType: z.string(),
  region: z.string(),
  criteriaText: z.string(),
  sourceUrl: z.string().url().optional(),
  supersededById: z.string().optional(),
});

// GET /v1/payers
router.get('/', requireAuth, userProvisioner, async (_req, res, next) => {
  try {
    res.json(await repo.listPayers());
  } catch (err) { next(err); }
});

// POST /v1/payers
router.post('/', requireAuth, userProvisioner, requireRole(UserRole.ADMIN), async (req, res, next) => {
  try {
    const body = CreatePayerSchema.parse(req.body);
    res.status(201).json(await repo.createPayer(body));
  } catch (err) { next(err); }
});

// GET /v1/payers/:id/criteria
router.get('/:id/criteria', requireAuth, userProvisioner, async (req, res, next) => {
  try {
    const serviceType = req.query['serviceType'] as string | undefined;
    res.json(await repo.getCurrentCriteria(req.params['id'] as string, serviceType));
  } catch (err) { next(err); }
});

// POST /v1/payers/:id/criteria
router.post('/:id/criteria', requireAuth, userProvisioner, requireRole(UserRole.ADMIN), async (req, res, next) => {
  try {
    const body = CreateCriteriaSchema.parse(req.body);
    res.status(201).json(
      await repo.createCriteriaVersion({ payerId: req.params['id'] as string, ...body }),
    );
  } catch (err) { next(err); }
});

export { router as payerRouter };

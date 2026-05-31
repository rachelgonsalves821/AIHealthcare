import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import { getDenialWinRates } from './analyticsRepository';

const router = Router();

// GET /v1/analytics/denials
router.get('/denials', requireAuth, userProvisioner, async (_req, res, next) => {
  try {
    res.json(await getDenialWinRates());
  } catch (err) {
    next(err);
  }
});

export { router as analyticsRouter };

import { Router } from 'express';
import { caseRouter } from '../modules/cases/caseRoutes';
import { appealRouter } from '../modules/appeals/appealRoutes';
import { payerRouter } from '../modules/payers/payerRoutes';
import { p2pRouter } from '../modules/peertopeer/p2pRoutes';
import { analyticsRouter } from '../modules/analytics/analyticsRoutes';
import { ingestRouter } from '../modules/ingest/ingestRoutes';

const router = Router();

router.use('/cases', caseRouter);
router.use('/appeals', appealRouter);
router.use('/payers', payerRouter);
router.use('/p2p', p2pRouter);
router.use('/analytics', analyticsRouter);
router.use('/ingest', ingestRouter);

export { router as v1Router };

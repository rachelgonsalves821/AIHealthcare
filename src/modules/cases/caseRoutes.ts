import { Router } from 'express';
import { z } from 'zod';
import { UserRole, CaseType, CaseSource, CaseStatus } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { userProvisioner } from '../../middleware/userProvisioner';
import * as svc from './caseService';
import * as evidenceSvc from '../evidence/evidenceService';
import * as p2pSvc from '../peertopeer/p2pService';
import * as appealSvc from '../appeals/appealService';
import * as outcomeSvc from '../outcomes/outcomeService';

const router = Router();

const CreateCaseSchema = z.object({
  patientId: z.string(),
  payerId: z.string(),
  serviceType: z.string(),
  caseType: z.nativeEnum(CaseType),
  source: z.nativeEnum(CaseSource),
  externalRef: z.string().optional(),
  complexityScore: z.number().min(0).max(1).optional(),
  assignedUserId: z.string().optional(),
});

const ListCasesQuerySchema = z.object({
  status: z.nativeEnum(CaseStatus).optional(),
  payerId: z.string().optional(),
  assignedUserId: z.string().optional(),
});

const TransitionSchema = z.object({
  status: z.nativeEnum(CaseStatus),
});

const ScheduleP2PSchema = z.object({
  reviewingPhysicianId: z.string(),
  scheduledAt: z.string().datetime(),
  payerReviewerName: z.string().optional(),
  prepPackRef: z.string().optional(),
});

const OutcomeSchema = z.object({
  payerId: z.string(),
  denialReason: z.string().optional(),
  resolution: z.enum(['APPROVED', 'UPHELD', 'PARTIAL']),
  recoveredValueCents: z.number().int().optional(),
});

// POST /v1/cases
router.post('/', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF), async (req, res, next) => {
  try {
    const body = CreateCaseSchema.parse(req.body);
    const c = await svc.createCase(
      { ...body, orgId: req.auth!.orgId },
      req.auth!.dbUserId,
      req.ip ?? undefined,
    );
    res.status(201).json(c);
  } catch (err) { next(err); }
});

// GET /v1/cases
router.get('/', requireAuth, userProvisioner, async (req, res, next) => {
  try {
    const query = ListCasesQuerySchema.parse(req.query);
    const cases = await svc.listCases({ orgId: req.auth!.orgId, ...query });
    res.json(cases);
  } catch (err) { next(err); }
});

// GET /v1/cases/:id
router.get('/:id', requireAuth, userProvisioner, async (req, res, next) => {
  try {
    const c = await svc.getCaseById(req.params['id'] as string, req.auth!.orgId);
    res.json(c);
  } catch (err) { next(err); }
});

// PATCH /v1/cases/:id
router.patch('/:id', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF, UserRole.CLINICIAN), async (req, res, next) => {
  try {
    const { status } = TransitionSchema.parse(req.body);
    const c = await svc.transitionStatus(
      req.params['id'] as string,
      req.auth!.orgId,
      status,
      req.auth!.dbUserId,
      req.ip ?? undefined,
    );
    res.json(c);
  } catch (err) { next(err); }
});

// POST /v1/cases/:id/evidence
router.post('/:id/evidence', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF), async (req, res, next) => {
  try {
    const job = await evidenceSvc.enqueueEvidenceGeneration(req.params['id'] as string, req.auth!.orgId);
    res.status(202).json({ message: 'Evidence generation enqueued', jobId: job });
  } catch (err) { next(err); }
});

// GET /v1/cases/:id/evidence
router.get('/:id/evidence', requireAuth, userProvisioner, async (req, res, next) => {
  try {
    const packs = await evidenceSvc.getEvidenceForCase(req.params['id'] as string, req.auth!.orgId);
    res.json(packs);
  } catch (err) { next(err); }
});

// POST /v1/cases/:id/p2p
router.post('/:id/p2p', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF, UserRole.CLINICIAN), async (req, res, next) => {
  try {
    const body = ScheduleP2PSchema.parse(req.body);
    const p2p = await p2pSvc.scheduleP2P(
      req.params['id'] as string,
      req.auth!.orgId,
      { ...body, scheduledAt: new Date(body.scheduledAt) },
      req.auth!.dbUserId,
      req.ip ?? undefined,
    );
    res.status(201).json(p2p);
  } catch (err) { next(err); }
});

// POST /v1/cases/:id/appeal
router.post('/:id/appeal', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF), async (req, res, next) => {
  try {
    const job = await appealSvc.enqueueAppealDraft(req.params['id'] as string, req.auth!.orgId);
    res.status(202).json({ message: 'Appeal draft generation enqueued', jobId: job });
  } catch (err) { next(err); }
});

// POST /v1/cases/:id/outcome
router.post('/:id/outcome', requireAuth, userProvisioner, requireRole(UserRole.ADMIN, UserRole.RCM_STAFF), async (req, res, next) => {
  try {
    const body = OutcomeSchema.parse(req.body);
    const outcome = await outcomeSvc.recordOutcome(
      req.params['id'] as string,
      req.auth!.orgId,
      body,
      req.auth!.dbUserId,
      req.ip ?? undefined,
    );
    res.status(201).json(outcome);
  } catch (err) { next(err); }
});

export { router as caseRouter };

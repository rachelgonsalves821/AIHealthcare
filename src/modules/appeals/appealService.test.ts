import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppealStatus } from '@prisma/client';

vi.mock('./appealRepository', () => ({
  getAppealById: vi.fn(),
  signOffAppeal: vi.fn(),
  submitAppeal: vi.fn(),
  updateAppealStatus: vi.fn(),
  getAppealsByCaseId: vi.fn(),
  createAppeal: vi.fn(),
}));

vi.mock('../audit/auditRepository', () => ({
  writeAuditLog: vi.fn(),
}));

describe('appealService.submitAppeal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws SignOffRequiredError when clinicianSignoffUserId is missing', async () => {
    const { getAppealById } = await import('./appealRepository');
    vi.mocked(getAppealById).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: null,
      signedOffAt: null,
      status: AppealStatus.AWAITING_SIGNOFF,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { submitAppeal } = await import('./appealService');
    await expect(submitAppeal('appeal-1', 'org-1', 'user-1')).rejects.toMatchObject({
      code: 'SIGNOFF_REQUIRED',
      statusCode: 422,
    });
  });

  it('throws SignOffRequiredError when signedOffAt is missing', async () => {
    const { getAppealById } = await import('./appealRepository');
    vi.mocked(getAppealById).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: 'clinician-1',
      signedOffAt: null,
      status: AppealStatus.SIGNED,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { submitAppeal } = await import('./appealService');
    await expect(submitAppeal('appeal-1', 'org-1', 'user-1')).rejects.toMatchObject({
      code: 'SIGNOFF_REQUIRED',
      statusCode: 422,
    });
  });

  it('throws ForbiddenError when appeal is not in SIGNED status', async () => {
    const { getAppealById } = await import('./appealRepository');
    vi.mocked(getAppealById).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: 'clinician-1',
      signedOffAt: new Date(),
      status: AppealStatus.AWAITING_SIGNOFF, // not SIGNED
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { submitAppeal } = await import('./appealService');
    await expect(submitAppeal('appeal-1', 'org-1', 'user-1')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('succeeds when appeal is properly signed off', async () => {
    const { getAppealById, submitAppeal: repoSubmit } = await import('./appealRepository');
    const signedOffAt = new Date();
    vi.mocked(getAppealById).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: 'clinician-1',
      signedOffAt,
      status: AppealStatus.SIGNED,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(repoSubmit).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: 'clinician-1',
      signedOffAt,
      status: AppealStatus.SUBMITTED,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { submitAppeal } = await import('./appealService');
    const result = await submitAppeal('appeal-1', 'org-1', 'user-1');
    expect(result.status).toBe(AppealStatus.SUBMITTED);
  });
});

describe('appealService.signOffAppeal', () => {
  it('throws ConflictError when appeal is already submitted', async () => {
    const { getAppealById } = await import('./appealRepository');
    vi.mocked(getAppealById).mockResolvedValue({
      id: 'appeal-1',
      caseId: 'case-1',
      draftContent: 'draft',
      draftedByModel: 'mock',
      clinicianSignoffUserId: 'clinician-1',
      signedOffAt: new Date(),
      status: AppealStatus.SUBMITTED,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { signOffAppeal } = await import('./appealService');
    await expect(signOffAppeal('appeal-1', 'clinician-1', 'org-1')).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

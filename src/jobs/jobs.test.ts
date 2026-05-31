import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockLLMProvider } from '../llm/mock';
import { setLLMProvider, getLLMProvider } from '../llm/provider';

vi.mock('../modules/cases/caseRepository', () => ({
  getCaseById: vi.fn().mockResolvedValue({
    id: 'case-1',
    orgId: 'org-1',
    payerId: 'payer-1',
    serviceType: 'SPINAL_FUSION',
    status: 'TRIAGED',
  }),
  updateCaseStatus: vi.fn().mockResolvedValue({ id: 'case-1', status: 'EVIDENCE_READY' }),
}));

vi.mock('../modules/payers/payerRepository', () => ({
  getCurrentCriteria: vi.fn().mockResolvedValue([
    { id: 'crit-1', version: 1, criteriaText: 'Test criteria', serviceType: 'SPINAL_FUSION' },
  ]),
}));

vi.mock('../modules/evidence/evidenceRepository', () => ({
  createEvidencePack: vi.fn().mockResolvedValue({ id: 'ep-1', caseId: 'case-1' }),
  getEvidencePacksByCaseId: vi.fn().mockResolvedValue([{
    id: 'ep-1',
    caseId: 'case-1',
    clinicalEvidence: { summary: 'mock evidence' },
    citedCriteria: [{ id: 'crit-1', version: 1 }],
    llmModel: 'mock-model-v1',
  }]),
}));

vi.mock('../modules/appeals/appealRepository', () => ({
  createAppeal: vi.fn().mockResolvedValue({ id: 'appeal-1', caseId: 'case-1', status: 'AWAITING_SIGNOFF' }),
}));

vi.mock('../modules/cases/caseService', () => ({
  transitionStatus: vi.fn().mockResolvedValue({ id: 'case-1', status: 'EVIDENCE_READY' }),
}));

vi.mock('../modules/audit/auditRepository', () => ({
  writeAuditLog: vi.fn(),
}));

describe('LLM mock provider', () => {
  beforeEach(() => {
    setLLMProvider(new MockLLMProvider());
  });

  it('sets and retrieves mock provider without error', () => {
    expect(() => getLLMProvider()).not.toThrow();
  });

  it('generates evidence without network calls', async () => {
    const provider = getLLMProvider();
    const result = await provider.generateEvidence({
      caseId: 'case-1',
      serviceType: 'SPINAL_FUSION',
      criteriaTexts: [{ id: 'crit-1', version: 1, text: 'Coverage requires 6 weeks.' }],
    });
    expect(result.model).toBe('mock-model-v1');
    expect(result.content).toMatchObject({ recommendation: 'APPROVE' });
  });

  it('generates appeal draft without network calls', async () => {
    const provider = getLLMProvider();
    const result = await provider.generateAppealDraft({
      caseId: 'case-1',
      serviceType: 'SPINAL_FUSION',
      evidenceSummary: { recommendation: 'APPROVE' },
      citedCriteria: [{ id: 'crit-1', version: 1 }],
    });
    expect(typeof result.content).toBe('string');
    expect(result.content).toContain('MOCK APPEAL DRAFT');
  });
});

describe('evidence.generate job handler', () => {
  beforeEach(() => {
    setLLMProvider(new MockLLMProvider());
  });

  it('runs handler and advances case to EVIDENCE_READY', async () => {
    const { handleEvidenceGenerate } = await import('./handlers/evidenceGenerate');
    const { transitionStatus } = await import('../modules/cases/caseService');

    await handleEvidenceGenerate({
      id: 'job-1',
      data: { caseId: 'case-1', orgId: 'org-1', requestedByUserId: 'user-1' },
    });

    expect(vi.mocked(transitionStatus)).toHaveBeenCalledWith(
      'case-1', 'org-1', 'EVIDENCE_READY', 'user-1',
    );
  });
});

describe('appeal.draft job handler', () => {
  beforeEach(() => {
    setLLMProvider(new MockLLMProvider());
  });

  it('runs handler and advances case to APPEAL_DRAFTED', async () => {
    const { handleAppealDraft } = await import('./handlers/appealDraft');
    const { transitionStatus } = await import('../modules/cases/caseService');

    await handleAppealDraft({
      id: 'job-2',
      data: { caseId: 'case-1', orgId: 'org-1', requestedByUserId: 'user-1' },
    });

    expect(vi.mocked(transitionStatus)).toHaveBeenCalledWith(
      'case-1', 'org-1', 'APPEAL_DRAFTED', 'user-1',
    );
  });
});

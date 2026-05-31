import { CaseStatus } from '@prisma/client';
import { InvalidTransitionError } from '../../lib/errors';

// Allowed forward transitions per the spec
const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.RECEIVED]: [CaseStatus.TRIAGED, CaseStatus.RESOLVED],
  [CaseStatus.TRIAGED]: [CaseStatus.EVIDENCE_READY, CaseStatus.RESOLVED],
  [CaseStatus.EVIDENCE_READY]: [
    CaseStatus.P2P_SCHEDULED,
    CaseStatus.APPEAL_DRAFTED, // skip P2P
    CaseStatus.RESOLVED,
  ],
  [CaseStatus.P2P_SCHEDULED]: [CaseStatus.APPEAL_DRAFTED, CaseStatus.RESOLVED],
  [CaseStatus.APPEAL_DRAFTED]: [CaseStatus.SUBMITTED, CaseStatus.RESOLVED],
  [CaseStatus.SUBMITTED]: [CaseStatus.RESOLVED],
  [CaseStatus.RESOLVED]: [], // terminal
};

export function assertValidTransition(from: CaseStatus, to: CaseStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function getAllowedTransitions(from: CaseStatus): CaseStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

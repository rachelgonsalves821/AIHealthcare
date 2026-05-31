import { describe, it, expect } from 'vitest';
import { CaseStatus } from '@prisma/client';
import { assertValidTransition, getAllowedTransitions } from './stateMachine';
import { InvalidTransitionError } from '../../lib/errors';

describe('assertValidTransition', () => {
  it('allows RECEIVED -> TRIAGED', () => {
    expect(() => assertValidTransition(CaseStatus.RECEIVED, CaseStatus.TRIAGED)).not.toThrow();
  });

  it('allows EVIDENCE_READY -> APPEAL_DRAFTED (skip P2P)', () => {
    expect(() =>
      assertValidTransition(CaseStatus.EVIDENCE_READY, CaseStatus.APPEAL_DRAFTED),
    ).not.toThrow();
  });

  it('allows any state -> RESOLVED', () => {
    for (const from of Object.values(CaseStatus)) {
      if (from === CaseStatus.RESOLVED) continue;
      expect(() =>
        assertValidTransition(from as CaseStatus, CaseStatus.RESOLVED),
      ).not.toThrow();
    }
  });

  it('rejects RECEIVED -> EVIDENCE_READY (skipping TRIAGED)', () => {
    expect(() =>
      assertValidTransition(CaseStatus.RECEIVED, CaseStatus.EVIDENCE_READY),
    ).toThrow(InvalidTransitionError);
  });

  it('rejects TRIAGED -> SUBMITTED', () => {
    expect(() =>
      assertValidTransition(CaseStatus.TRIAGED, CaseStatus.SUBMITTED),
    ).toThrow(InvalidTransitionError);
  });

  it('rejects RESOLVED -> anything', () => {
    expect(() =>
      assertValidTransition(CaseStatus.RESOLVED, CaseStatus.TRIAGED),
    ).toThrow(InvalidTransitionError);
  });

  it('rejects APPEAL_DRAFTED -> P2P_SCHEDULED (backwards)', () => {
    expect(() =>
      assertValidTransition(CaseStatus.APPEAL_DRAFTED, CaseStatus.P2P_SCHEDULED),
    ).toThrow(InvalidTransitionError);
  });

  it('error has correct code and message', () => {
    let caught: unknown;
    try {
      assertValidTransition(CaseStatus.RECEIVED, CaseStatus.SUBMITTED);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(InvalidTransitionError);
    expect((caught as InvalidTransitionError).code).toBe('INVALID_TRANSITION');
    expect((caught as InvalidTransitionError).statusCode).toBe(400);
  });

  it('allows the full happy path', () => {
    const path = [
      CaseStatus.RECEIVED,
      CaseStatus.TRIAGED,
      CaseStatus.EVIDENCE_READY,
      CaseStatus.P2P_SCHEDULED,
      CaseStatus.APPEAL_DRAFTED,
      CaseStatus.SUBMITTED,
      CaseStatus.RESOLVED,
    ];
    for (let i = 0; i < path.length - 1; i++) {
      expect(() => assertValidTransition(path[i]!, path[i + 1]!)).not.toThrow();
    }
  });
});

describe('getAllowedTransitions', () => {
  it('returns correct transitions for EVIDENCE_READY', () => {
    const allowed = getAllowedTransitions(CaseStatus.EVIDENCE_READY);
    expect(allowed).toContain(CaseStatus.P2P_SCHEDULED);
    expect(allowed).toContain(CaseStatus.APPEAL_DRAFTED);
    expect(allowed).toContain(CaseStatus.RESOLVED);
    expect(allowed).not.toContain(CaseStatus.TRIAGED);
  });

  it('returns empty array for RESOLVED', () => {
    expect(getAllowedTransitions(CaseStatus.RESOLVED)).toEqual([]);
  });
});

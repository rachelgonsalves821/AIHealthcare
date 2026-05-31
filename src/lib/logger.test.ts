import { describe, it, expect } from 'vitest';
import { redactPhi } from './logger';

describe('redactPhi', () => {
  it('redacts known PHI field names', () => {
    const input = {
      mrn: '123456',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      phone: '555-1234',
      orgId: 'org-1',
      caseId: 'case-1',
    };
    const result = redactPhi(input) as Record<string, unknown>;
    expect(result['mrn']).toBe('[REDACTED]');
    expect(result['firstName']).toBe('[REDACTED]');
    expect(result['lastName']).toBe('[REDACTED]');
    expect(result['dateOfBirth']).toBe('[REDACTED]');
    expect(result['phone']).toBe('[REDACTED]');
    // Non-PHI fields should pass through
    expect(result['orgId']).toBe('org-1');
    expect(result['caseId']).toBe('case-1');
  });

  it('recursively redacts nested PHI', () => {
    const input = {
      patient: {
        externalMrnHash: 'sha256:abc',
        sex: 'F',
      },
      case: { id: 'case-1' },
    };
    const result = redactPhi(input) as Record<string, Record<string, unknown>>;
    expect(result['patient']?.['externalMrnHash']).toBe('[REDACTED]');
    expect(result['patient']?.['sex']).toBe('F');
    expect(result['case']?.['id']).toBe('case-1');
  });

  it('does not redact non-PHI fields', () => {
    const input = { orgId: 'org-1', status: 'ACTIVE', recoveredValueCents: 50000 };
    const result = redactPhi(input) as Record<string, unknown>;
    expect(result['orgId']).toBe('org-1');
    expect(result['status']).toBe('ACTIVE');
    expect(result['recoveredValueCents']).toBe(50000);
  });

  it('handles null and undefined gracefully', () => {
    expect(redactPhi(null)).toBeNull();
    expect(redactPhi(undefined)).toBeUndefined();
    expect(redactPhi('string')).toBe('string');
  });

  it('verifies patient fields never appear in serialized logs', () => {
    const patientRecord = {
      id: 'patient-1',
      externalMrnHash: 'sha256:deadbeef',
      dateOfBirth: '1975-06-15',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '800-555-0000',
    };
    const redacted = redactPhi(patientRecord) as Record<string, unknown>;
    const serialized = JSON.stringify(redacted);

    // None of the actual PHI values should appear in the serialized output
    expect(serialized).not.toContain('sha256:deadbeef');
    expect(serialized).not.toContain('1975-06-15');
    expect(serialized).not.toContain('Jane');
    expect(serialized).not.toContain('Smith');
    expect(serialized).not.toContain('800-555-0000');
    // But [REDACTED] placeholder should be present
    expect(serialized).toContain('[REDACTED]');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

vi.mock('@clerk/express', () => ({
  clerkMiddleware: vi.fn(),
  getAuth: vi.fn(),
}));

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next with UnauthorizedError when no userId', async () => {
    const { getAuth } = await import('@clerk/express');
    vi.mocked(getAuth).mockReturnValue({ userId: null } as ReturnType<typeof getAuth>);
    const { requireAuth } = await import('./auth');
    const req = { headers: {}, auth: undefined } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('calls next with UnauthorizedError when no orgId', async () => {
    const { getAuth } = await import('@clerk/express');
    vi.mocked(getAuth).mockReturnValue({
      userId: 'user_123',
      orgId: null,
      sessionClaims: {},
    } as unknown as ReturnType<typeof getAuth>);
    const { requireAuth } = await import('./auth');
    const req = { headers: {}, auth: undefined } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('calls next with UnauthorizedError when role missing', async () => {
    const { getAuth } = await import('@clerk/express');
    vi.mocked(getAuth).mockReturnValue({
      userId: 'user_123',
      orgId: 'org_abc',
      sessionClaims: { publicMetadata: {} },
    } as unknown as ReturnType<typeof getAuth>);
    const { requireAuth } = await import('./auth');
    const req = { headers: {}, auth: undefined } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('attaches auth context when valid claims present', async () => {
    const { getAuth } = await import('@clerk/express');
    vi.mocked(getAuth).mockReturnValue({
      userId: 'user_123',
      orgId: 'org_abc',
      sessionClaims: { publicMetadata: { role: UserRole.CLINICIAN } },
    } as unknown as ReturnType<typeof getAuth>);
    const { requireAuth } = await import('./auth');
    const req = { headers: {}, auth: undefined } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect((req as Request).auth).toMatchObject({
      clerkUserId: 'user_123',
      orgId: 'org_abc',
      role: UserRole.CLINICIAN,
    });
  });
});

describe('requireRole', () => {
  it('calls next with ForbiddenError when role not in allowed list', async () => {
    const { requireRole } = await import('./auth');
    const req = {
      auth: { clerkUserId: 'u', orgId: 'o', role: UserRole.RCM_STAFF, dbUserId: 'd' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireRole(UserRole.CLINICIAN)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('calls next without error when role is allowed', async () => {
    const { requireRole } = await import('./auth');
    const req = {
      auth: { clerkUserId: 'u', orgId: 'o', role: UserRole.ADMIN, dbUserId: 'd' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireRole(UserRole.ADMIN, UserRole.RCM_STAFF)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with UnauthorizedError when no auth context', async () => {
    const { requireRole } = await import('./auth');
    const req = { auth: undefined } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    requireRole(UserRole.ADMIN)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

import type { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import type { UserRole } from '@prisma/client';

export { clerkMiddleware };

export interface AuthContext {
  clerkUserId: string;
  orgId: string;
  role: UserRole;
  dbUserId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Extracts Clerk auth and attaches orgId + role to req.auth.
 * Role is read from Clerk's publicMetadata.role claim.
 * The DB user is provisioned on first request in the users module.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const clerkAuth = getAuth(req);

  if (!clerkAuth?.userId) {
    return next(new UnauthorizedError());
  }

  const orgId = clerkAuth.orgId ?? (clerkAuth.sessionClaims?.['orgId'] as string | undefined);
  if (!orgId) {
    return next(new UnauthorizedError('Organization context required'));
  }

  const role = (
    (clerkAuth.sessionClaims?.['publicMetadata'] as Record<string, unknown> | undefined)?.['role']
  ) as UserRole | undefined;

  if (!role) {
    return next(new UnauthorizedError('User role not set — contact your administrator'));
  }

  req.auth = {
    clerkUserId: clerkAuth.userId,
    orgId,
    role,
    dbUserId: '', // populated by userProvisioner middleware
  };

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.auth.role)) {
      return next(
        new ForbiddenError(
          `Role '${req.auth.role}' is not allowed. Required: ${roles.join(' | ')}`,
        ),
      );
    }
    next();
  };
}

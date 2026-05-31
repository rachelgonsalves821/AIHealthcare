import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { UnauthorizedError } from '../lib/errors';

/**
 * Provisions a User record in the DB on first authenticated request.
 * Attaches the DB user ID to req.auth.dbUserId.
 * Must run after requireAuth.
 */
export async function userProvisioner(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) return next(new UnauthorizedError());

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId: req.auth.clerkUserId },
      update: { role: req.auth.role },
      create: {
        clerkUserId: req.auth.clerkUserId,
        orgId: req.auth.orgId,
        email: req.auth.clerkUserId, // real email fetched from Clerk in prod
        name: req.auth.clerkUserId,
        role: req.auth.role,
      },
    });
    req.auth.dbUserId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}

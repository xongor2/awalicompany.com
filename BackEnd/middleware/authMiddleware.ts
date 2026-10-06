import { Request, Response, NextFunction } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { User } from '../../DataBase/models.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Authentication Middleware - Verifies Bearer session token
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  void (async () => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized: Authentication token missing' });
    const user = await db.getSessionUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    req.user = user;
    next();
  })().catch(next);
}

/**
 * Optional Authentication Middleware - Attaches user if valid token is provided
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  void (async () => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      const user = await db.getSessionUser(token);
      if (user) req.user = user;
    }
    next();
  })().catch(next);
}

/**
 * Strip password hashes before returning user object
 */
export function sanitizeUser(user: User) {
  const { password_hash, password_salt, ...safeUser } = user;
  return safeUser;
}

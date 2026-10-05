import { Request, Response, NextFunction } from 'express';
import { db, User } from '../../DataBase/db.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Authentication Middleware - Verifies Bearer session token
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token missing' });
  }

  const user = db.getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  req.user = user;
  next();
}

/**
 * Optional Authentication Middleware - Attaches user if valid token is provided
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const user = db.getSessionUser(token);
    if (user) req.user = user;
  }
  next();
}

/**
 * Strip password hashes before returning user object
 */
export function sanitizeUser(user: User) {
  const { password_hash, password_salt, ...safeUser } = user;
  return safeUser;
}

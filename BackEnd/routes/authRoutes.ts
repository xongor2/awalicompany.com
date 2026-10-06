import { Router, Request, Response } from 'express';
import { db, verifyPassword } from '../../DataBase/repository.ts';
import { authMiddleware, sanitizeUser, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'Inactive') {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact an administrator.' });
  }

  const isValid = verifyPassword(password, user.password_hash, user.password_salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = await db.createSession(user.id);
  return res.json({
    message: 'Authentication successful',
    token,
    user: sanitizeUser(user)
  });
}));

// POST /api/auth/register
authRouter.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const publicRoles = ['Agent', 'Agency', 'Client'] as const;
    const selectedRole = publicRoles.includes(role) ? role : 'Client';
    const newUser = await db.createUser({
      name,
      email,
      password,
      role: selectedRole,
      status: 'Active'
    });

    const token = await db.createSession(newUser.id);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
}));

// GET /api/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: sanitizeUser(req.user!) });
});

// POST /api/auth/logout
authRouter.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    await db.deleteSession(token);
  }
  return res.json({ message: 'Logged out successfully' });
}));

// GET /api/auth/users (Admin only)
authRouter.get('/users', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const users = (await db.getUsers()).map(sanitizeUser);
  return res.json(users);
}));

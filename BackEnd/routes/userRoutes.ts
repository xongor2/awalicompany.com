import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/db.ts';
import { authMiddleware, sanitizeUser, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const userRouter = Router();

// GET /api/users
userRouter.get('/users', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const { search, role, status } = req.query;
  const users = db.getUsers({
    search: typeof search === 'string' ? search : undefined,
    role: typeof role === 'string' ? role : undefined,
    status: typeof status === 'string' ? status : undefined,
  }).map(sanitizeUser);
  return res.json(users);
});

// GET /api/users/:id
userRouter.get('/users/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(sanitizeUser(user));
});

// POST /api/users
userRouter.post('/users', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  try {
    const newUser = db.createUser(req.body);
    return res.status(201).json(sanitizeUser(newUser));
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create user' });
  }
});

// PUT /api/users/:id
userRouter.put('/users/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(sanitizeUser(updated));
});

// DELETE /api/users/:id
userRouter.delete('/users/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ message: 'User deleted successfully' });
});

// GET /api/profile
userRouter.get('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(sanitizeUser(req.user!));
});

// PUT /api/profile
userRouter.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateUser(req.user!.id, req.body);
  if (!updated) {
    return res.status(400).json({ error: 'Failed to update profile' });
  }
  return res.json(sanitizeUser(updated));
});

// PUT /api/profile/password
userRouter.put('/profile/password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  const success = db.updateUserPassword(req.user!.id, newPassword);
  if (!success) {
    return res.status(400).json({ error: 'Password update failed' });
  }
  return res.json({ message: 'Password updated successfully' });
});

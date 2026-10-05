import { Router, Response } from 'express';
import { db } from '../../DataBase/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const roleRouter = Router();

roleRouter.use(authMiddleware);
roleRouter.use((req: AuthenticatedRequest, res: Response, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
});

roleRouter.get('/', (_req, res) => {
  const roles = db.getRoles().map(role => ({
    ...role,
    userCount: db.getUsers({ role: role.name }).length
  }));
  return res.json(roles);
});

roleRouter.post('/', (req, res) => {
  try {
    return res.status(201).json(db.createRole(req.body));
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create role.' });
  }
});

roleRouter.put('/:id', (req, res) => {
  try {
    const role = db.updateRole(req.params.id, req.body);
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    return res.json(role);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update role.' });
  }
});

roleRouter.delete('/:id', (req, res) => {
  try {
    if (!db.deleteRole(req.params.id)) return res.status(404).json({ error: 'Role not found.' });
    return res.json({ message: 'Role deleted successfully.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to delete role.' });
  }
});

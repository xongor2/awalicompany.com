import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const roleRouter = Router();

roleRouter.use(authMiddleware);
roleRouter.use((req: AuthenticatedRequest, res: Response, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
});

roleRouter.get('/', asyncHandler(async (_req, res) => {
  const roles = await db.getRoles();
  const rolesWithCounts = await Promise.all(roles.map(async role => ({
    ...role,
    userCount: (await db.getUsers({ role: role.name })).length
  })));
  return res.json(rolesWithCounts);
}));

roleRouter.post('/', asyncHandler(async (req, res) => {
  try {
    return res.status(201).json(await db.createRole(req.body));
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create role.' });
  }
}));

roleRouter.put('/:id', asyncHandler(async (req, res) => {
  try {
    const role = await db.updateRole(req.params.id, req.body);
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    return res.json(role);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update role.' });
  }
}));

roleRouter.delete('/:id', asyncHandler(async (req, res) => {
  try {
    if (!await db.deleteRole(req.params.id)) return res.status(404).json({ error: 'Role not found.' });
    return res.json({ message: 'Role deleted successfully.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to delete role.' });
  }
}));

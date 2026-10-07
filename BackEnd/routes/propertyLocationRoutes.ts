import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { PropertyLocationKind } from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const propertyLocationRouter = Router();

const parseKind = (value: string): PropertyLocationKind | null => {
  if (value.toLowerCase() === 'countries') return 'Country';
  if (value.toLowerCase() === 'cities') return 'City';
  return null;
};

const canManage = (req: AuthenticatedRequest) => req.user?.role === 'Admin' || req.user?.role === 'Agent';

propertyLocationRouter.get('/:kind', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kind = parseKind(req.params.kind);
  if (!kind) return res.status(400).json({ error: 'Location category must be countries or cities.' });
  return res.json(await db.getPropertyLocationCategories(kind));
}));

propertyLocationRouter.post('/:kind', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kind = parseKind(req.params.kind);
  if (!kind) return res.status(400).json({ error: 'Location category must be countries or cities.' });
  if (!canManage(req)) return res.status(403).json({ error: 'Admin or Agent access is required.' });
  if (!req.body.name?.trim()) return res.status(400).json({ error: `${kind} name is required.` });
  const category = await db.createPropertyLocationCategory(kind, {
    name: req.body.name,
    description: req.body.description || '',
  });
  return res.status(201).json(category);
}));

propertyLocationRouter.put('/:kind/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kind = parseKind(req.params.kind);
  if (!kind) return res.status(400).json({ error: 'Location category must be countries or cities.' });
  if (!canManage(req)) return res.status(403).json({ error: 'Admin or Agent access is required.' });
  const current = await db.getPropertyLocationCategory(req.params.id);
  if (!current || current.kind !== kind) return res.status(404).json({ error: `${kind} not found.` });
  const updated = await db.updatePropertyLocationCategory(req.params.id, req.body);
  return res.json(updated);
}));

propertyLocationRouter.delete('/:kind/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kind = parseKind(req.params.kind);
  if (!kind) return res.status(400).json({ error: 'Location category must be countries or cities.' });
  if (req.user?.role !== 'Admin') return res.status(403).json({ error: 'Only Admins can delete location categories.' });
  const current = await db.getPropertyLocationCategory(req.params.id);
  if (!current || current.kind !== kind) return res.status(404).json({ error: `${kind} not found.` });
  await db.deletePropertyLocationCategory(req.params.id);
  return res.json({ message: `${kind} deleted successfully.`, id: req.params.id });
}));

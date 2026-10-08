import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { EducationDegree } from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const educationRouter = Router();

const VALID_DEGREES: EducationDegree[] = ['Certificate', 'Bachelor', 'Master', 'PHD'];

const normalizeDegrees = (value: unknown): EducationDegree[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((degree): degree is EducationDegree =>
    typeof degree === 'string' && VALID_DEGREES.includes(degree as EducationDegree),
  ))];
};

const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

educationRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  let opportunities = await db.getEducationOpportunities();
  if (search) {
    opportunities = opportunities.filter(item =>
      item.title.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.availableDegrees.some(degree => degree.toLowerCase().includes(search)),
    );
  }
  return res.json(opportunities);
}));

educationRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const availableDegrees = normalizeDegrees(req.body.availableDegrees);
  const universityUrl = normalizeUrl(req.body.universityUrl);

  if (!title || !description || availableDegrees.length === 0 || !universityUrl) {
    return res.status(400).json({
      error: 'Title, description, at least one available degree, and a valid university link are required.',
    });
  }

  return res.status(201).json(await db.createEducationOpportunity({
    title,
    description,
    availableDegrees,
    universityUrl,
  }));
}));

educationRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const current = await db.getEducationOpportunityById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Education opportunity not found.' });

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : current.title;
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : current.description;
  const availableDegrees = req.body.availableDegrees === undefined
    ? current.availableDegrees
    : normalizeDegrees(req.body.availableDegrees);
  const universityUrl = req.body.universityUrl === undefined
    ? current.universityUrl
    : normalizeUrl(req.body.universityUrl);

  if (!title || !description || availableDegrees.length === 0 || !universityUrl) {
    return res.status(400).json({
      error: 'Title, description, at least one available degree, and a valid university link are required.',
    });
  }

  return res.json(await db.updateEducationOpportunity(req.params.id, {
    title,
    description,
    availableDegrees,
    universityUrl,
  }));
}));

educationRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  if (!await db.deleteEducationOpportunity(req.params.id)) {
    return res.status(404).json({ error: 'Education opportunity not found.' });
  }
  return res.json({ message: 'Education opportunity deleted successfully.', id: req.params.id });
}));

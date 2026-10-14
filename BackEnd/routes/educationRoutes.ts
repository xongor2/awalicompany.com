import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { EducationDegree } from '../../DataBase/models.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
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

const normalizeThumbnail = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const thumbnail = value.trim();
  if (!thumbnail || thumbnail.length > 8_000_000) return null;
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(thumbnail)) return thumbnail;
  return normalizeUrl(thumbnail);
};

educationRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const isAgencyPortal = req.query.portal === 'true' && req.user?.role === 'Agency';
  let opportunities = await db.getEducationOpportunities(isAgencyPortal ? { createdByUserId: req.user!.id } : undefined);
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
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot add education opportunities.' });
  }

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const thumbnail = normalizeThumbnail(req.body.thumbnail);
  const availableDegrees = normalizeDegrees(req.body.availableDegrees);
  const universityUrl = normalizeUrl(req.body.universityUrl);

  if (!title || !description || !thumbnail || availableDegrees.length === 0 || !universityUrl) {
    return res.status(400).json({
      error: 'Title, description, thumbnail, at least one available degree, and a valid university link are required.',
    });
  }

  return res.status(201).json(await db.createEducationOpportunity({
    title,
    description,
    thumbnail,
    availableDegrees,
    universityUrl,
    createdByUserId: req.user.id,
  }));
}));

educationRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot update education opportunities.' });
  }

  const current = await db.getEducationOpportunityById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Education opportunity not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only update education opportunities you created.' });
  }

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : current.title;
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : current.description;
  const thumbnail = req.body.thumbnail === undefined ? current.thumbnail : normalizeThumbnail(req.body.thumbnail);
  const availableDegrees = req.body.availableDegrees === undefined
    ? current.availableDegrees
    : normalizeDegrees(req.body.availableDegrees);
  const universityUrl = req.body.universityUrl === undefined
    ? current.universityUrl
    : normalizeUrl(req.body.universityUrl);

  if (!title || !description || !thumbnail || availableDegrees.length === 0 || !universityUrl) {
    return res.status(400).json({
      error: 'Title, description, thumbnail, at least one available degree, and a valid university link are required.',
    });
  }

  return res.json(await db.updateEducationOpportunity(req.params.id, {
    title,
    description,
    thumbnail,
    availableDegrees,
    universityUrl,
  }));
}));

educationRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot delete education opportunities.' });
  }
  const current = await db.getEducationOpportunityById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Education opportunity not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only delete education opportunities you created.' });
  }
  if (!await db.deleteEducationOpportunity(req.params.id)) {
    return res.status(404).json({ error: 'Education opportunity not found.' });
  }
  return res.json({ message: 'Education opportunity deleted successfully.', id: req.params.id });
}));

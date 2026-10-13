import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { HealthSpecialtyStatus } from '../../DataBase/models.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const healthSpecialtyRouter = Router();

const VALID_STATUSES: HealthSpecialtyStatus[] = ['Active', 'Inactive'];

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const stringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.slice(0, 250)))]
    .slice(0, 20);
};

const imageValue = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const image = value.trim();
  if (!image || image.length > 8_000_000) return null;
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(image)) return image;
  try {
    const url = new URL(image);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

healthSpecialtyRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const isAgencyPortal = req.query.portal === 'true' && req.user?.role === 'Agency';
  let items = await db.getHealthSpecialties(isAgencyPortal ? { createdByUserId: req.user!.id } : undefined);
  if (search) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.country.toLowerCase().includes(search) ||
      item.city.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.keyProcedures.some(procedure => procedure.toLowerCase().includes(search)) ||
      item.destinations.some(destination => destination.toLowerCase().includes(search)),
    );
  }
  return res.json(items);
}));

healthSpecialtyRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot add health services.' });
  }

  const category = text(req.body.category, 150);
  const name = text(req.body.name, 255);
  const country = text(req.body.country, 150);
  const city = text(req.body.city, 150);
  const tagline = `${city}, ${country}`;
  const description = text(req.body.description, 10_000);
  const keyProcedures = stringList(req.body.keyProcedures);
  const destinations = stringList(req.body.destinations);
  const image = imageValue(req.body.image);
  const status: HealthSpecialtyStatus = VALID_STATUSES.includes(req.body.status) ? req.body.status : 'Active';

  if (!category || !name || !country || !city || !description || !image || keyProcedures.length === 0 || destinations.length === 0) {
    return res.status(400).json({
      error: 'Category, title, country, city, description, image, clinical focus, and destination are required.',
    });
  }

  return res.status(201).json(await db.createHealthSpecialty({
    category, name, country, city, tagline, description, keyProcedures, destinations, image, status,
    createdByUserId: req.user.id,
  }));
}));

healthSpecialtyRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot update health services.' });
  }

  const current = await db.getHealthSpecialtyById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Health specialty not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only update health services you created.' });
  }

  const category = req.body.category === undefined ? current.category : text(req.body.category, 150);
  const name = req.body.name === undefined ? current.name : text(req.body.name, 255);
  const country = req.body.country === undefined ? current.country : text(req.body.country, 150);
  const city = req.body.city === undefined ? current.city : text(req.body.city, 150);
  const tagline = `${city}, ${country}`;
  const description = req.body.description === undefined ? current.description : text(req.body.description, 10_000);
  const keyProcedures = req.body.keyProcedures === undefined ? current.keyProcedures : stringList(req.body.keyProcedures);
  const destinations = req.body.destinations === undefined ? current.destinations : stringList(req.body.destinations);
  const image = req.body.image === undefined ? current.image : imageValue(req.body.image);
  const status = req.body.status === undefined
    ? current.status
    : VALID_STATUSES.includes(req.body.status) ? req.body.status as HealthSpecialtyStatus : null;

  if (!category || !name || !country || !city || !description || !image || !status || keyProcedures.length === 0 || destinations.length === 0) {
    return res.status(400).json({
      error: 'Category, title, country, city, description, image, clinical focus, destination, and valid status are required.',
    });
  }

  return res.json(await db.updateHealthSpecialty(req.params.id, {
    category, name, country, city, tagline, description, keyProcedures, destinations, image, status,
  }));
}));

healthSpecialtyRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot delete health services.' });
  }
  const current = await db.getHealthSpecialtyById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Health specialty not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only delete health services you created.' });
  }
  if (!await db.deleteHealthSpecialty(req.params.id)) {
    return res.status(404).json({ error: 'Health specialty not found.' });
  }
  return res.json({ message: 'Health specialty deleted successfully.', id: req.params.id });
}));

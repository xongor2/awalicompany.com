import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const agencyRouter = Router();

// GET /api/agencies
agencyRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { country, city, search, verified } = req.query;

  const agencies = await db.getAgencies({
    search: typeof search === 'string' ? search : undefined,
    country: typeof country === 'string' ? country : undefined,
    city: typeof city === 'string' ? city : undefined,
    verified: typeof verified === 'string' ? verified : undefined,
  });

  return res.json(agencies);
}));

// GET /api/agencies/:id
agencyRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const agency = await db.getAgencyById(req.params.id);
  if (!agency) {
    return res.status(404).json({ error: 'Agency not found.' });
  }
  return res.json(agency);
}));

// POST /api/agencies
agencyRouter.post('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, country, city, contactName, phone, email, address, website } = req.body;
  if (!name || !country || !city || !contactName || !phone || !email) {
    return res.status(400).json({ error: 'Missing required agency fields: name, country, city, contactName, phone, email' });
  }

  const newAgency = await db.createAgency({
    name,
    country,
    city,
    contactName,
    phone,
    email,
    address: address || '',
    website: website || '',
    logo: req.body.logo,
    verified: req.body.verified !== undefined ? Boolean(req.body.verified) : false
  });

  return res.status(201).json(newAgency);
}));

// PUT /api/agencies/:id
agencyRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const updated = await db.updateAgency(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Agency not found.' });
  }
  return res.json(updated);
}));

// DELETE /api/agencies/:id
agencyRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const deleted = await db.deleteAgency(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Agency not found.' });
  }
  return res.json({ message: 'Agency deleted successfully', id: req.params.id });
}));

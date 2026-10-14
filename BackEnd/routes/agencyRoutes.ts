import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const agencyRouter = Router();

// GET /api/agencies
agencyRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { country, city, search, verified, portal } = req.query;
  const isAgencyPortal = portal === 'true' && req.user?.role === 'Agency';

  if (isAgencyPortal && req.user) {
    const existing = await db.getAgencyByUserId(req.user.id)
      || await db.claimAgencyByEmail(req.user.id, req.user.email);
    return res.json(existing ? [existing] : []);
  }

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
  const { name, country, city, phone, email, address, website } = req.body;
  const isAgencyUser = req.user?.role === 'Agency';
  const contactName = isAgencyUser ? req.user!.name : req.body.contactName;

  if (req.user && req.user.role !== 'Admin' && !isAgencyUser) {
    return res.status(403).json({ error: 'Only Admin and Agency accounts can create an Agency profile.' });
  }

  if (!name || !country || !city || !contactName || !email) {
    return res.status(400).json({ error: 'Missing required agency fields: name, country, city, contactName, email' });
  }

  if (isAgencyUser && req.user) {
    const existing = await db.getAgencyByUserId(req.user.id)
      || await db.claimAgencyByEmail(req.user.id, req.user.email);
    if (existing) {
      return res.status(409).json({ error: 'Your Agency profile already exists. Please edit the existing profile.' });
    }
  }

  const newAgency = await db.createAgency({
    userId: isAgencyUser ? req.user!.id : null,
    name,
    country,
    city,
    contactName,
    phone: phone || '',
    email,
    address: address || '',
    website: website || '',
    logo: req.body.logo,
    verified: isAgencyUser ? true : (req.body.verified !== undefined ? Boolean(req.body.verified) : false)
  });

  return res.status(201).json(newAgency);
}));

// PUT /api/agencies/:id
agencyRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const current = await db.getAgencyById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Agency not found.' });
  }

  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agency') {
    return res.status(403).json({ error: 'Forbidden: Agency profile access required.' });
  }

  if (req.user.role === 'Agency') {
    const owned = current.userId === req.user.id
      ? current
      : await db.claimAgencyByEmail(req.user.id, req.user.email);
    if (!owned || owned.id !== current.id) {
      return res.status(403).json({ error: 'You can only update your own Agency profile.' });
    }
    if (!req.body.name || !req.body.country || !req.body.city || !req.body.email) {
      return res.status(400).json({ error: 'Missing required Agency profile fields: name, country, city, email' });
    }
  }

  const updateData = req.user.role === 'Agency'
    ? {
        name: req.body.name,
        country: req.body.country,
        city: req.body.city,
        email: req.body.email,
        phone: req.body.phone || '',
        website: req.body.website || '',
        address: req.body.address || '',
        logo: req.body.logo,
        contactName: req.user.name,
        verified: true,
      }
    : req.body;
  const updated = await db.updateAgency(req.params.id, updateData);
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

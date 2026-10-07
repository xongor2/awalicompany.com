import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const propertyRouter = Router();

// GET /api/properties
propertyRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type, location, status, search, minPrice, maxPrice, buy_rent } = req.query;

  let properties = await db.getProperties();

  if (type && typeof type === 'string' && type !== 'All') {
    properties = properties.filter(p => p.property_type.toLowerCase() === type.toLowerCase());
  }

  if (location && typeof location === 'string') {
    properties = properties.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (status && typeof status === 'string' && status !== 'All') {
    properties = properties.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (buy_rent && typeof buy_rent === 'string' && buy_rent !== 'All') {
    properties = properties.filter(p => p.buy_rent?.toLowerCase() === buy_rent.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    properties = properties.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    properties = properties.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    properties = properties.filter(p => p.price <= Number(maxPrice));
  }

  return res.json(properties);
}));

// GET /api/properties/:id
propertyRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const property = await db.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  return res.json(property);
}));

// POST /api/properties (Admin or Agent)
propertyRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required to add properties.' });
  }

  const { title, description, property_type, location, price, image } = req.body;
  if (!title || !description || !property_type || !location || price === undefined) {
    return res.status(400).json({ error: 'Missing required property fields: title, description, property_type, location, price' });
  }

  await db.ensurePropertyLocationCategory('City', String(location));

  const newProperty = await db.createProperty({
    ...req.body,
    price: Number(price),
    image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    status: req.body.status || 'Active'
  });

  return res.status(201).json(newProperty);
}));

// PUT /api/properties/:id
propertyRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required.' });
  }

  if (!await db.getPropertyById(req.params.id)) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  if (typeof req.body.location === 'string' && req.body.location.trim()) {
    await db.ensurePropertyLocationCategory('City', req.body.location);
  }

  const updated = await db.updateProperty(req.params.id, req.body);
  return res.json(updated);
}));

// DELETE /api/properties/:id
propertyRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can delete properties.' });
  }

  const deleted = await db.deleteProperty(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  return res.json({ message: 'Property deleted successfully', id: req.params.id });
}));

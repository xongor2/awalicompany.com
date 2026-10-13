import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const propertyRouter = Router();

// GET /api/properties
propertyRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type, location, status, search, minPrice, maxPrice, buy_rent } = req.query;

  const isAgencyPortal = req.query.portal === 'true' && req.user?.role === 'Agency';
  let properties = await db.getProperties(isAgencyPortal ? { createdByUserId: req.user!.id } : undefined);

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

// POST /api/properties (Admin, Agent, or Agency)
propertyRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agent', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot add properties.' });
  }

  const { title, description, property_type, price, image } = req.body;
  const city = String(req.body.city || '').trim();
  const country = String(req.body.country || '').trim();
  if (!title || !description || !property_type || !city || !country || price === undefined) {
    return res.status(400).json({ error: 'Missing required property fields: title, description, property_type, city, country, price' });
  }

  await Promise.all([
    db.ensurePropertyLocationCategory('City', city),
    db.ensurePropertyLocationCategory('Country', country),
  ]);

  const propertyData = { ...req.body };
  delete propertyData.city;
  delete propertyData.country;

  const newProperty = await db.createProperty({
    ...propertyData,
    location: `${city}, ${country}`,
    price: Number(price),
    image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    status: req.body.status || 'Active',
    created_by_user_id: req.user.id,
  });

  return res.status(201).json(newProperty);
}));

// PUT /api/properties/:id
propertyRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agent', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot update properties.' });
  }

  const current = await db.getPropertyById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  if (req.user.role === 'Agency' && current.created_by_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only update properties you created.' });
  }

  const city = typeof req.body.city === 'string' ? req.body.city.trim() : '';
  const country = typeof req.body.country === 'string' ? req.body.country.trim() : '';
  if (city || country) {
    if (!city || !country) {
      return res.status(400).json({ error: 'Both city and country are required.' });
    }
    await Promise.all([
      db.ensurePropertyLocationCategory('City', city),
      db.ensurePropertyLocationCategory('Country', country),
    ]);
  }

  const propertyUpdates = { ...req.body };
  delete propertyUpdates.city;
  delete propertyUpdates.country;
  if (city && country) propertyUpdates.location = `${city}, ${country}`;
  const updated = await db.updateProperty(req.params.id, propertyUpdates);
  return res.json(updated);
}));

// DELETE /api/properties/:id
propertyRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot delete properties.' });
  }
  const current = await db.getPropertyById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  if (req.user.role === 'Agency' && current.created_by_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only delete properties you created.' });
  }

  const deleted = await db.deleteProperty(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Property not found.' });
  return res.json({ message: 'Property deleted successfully', id: req.params.id });
}));

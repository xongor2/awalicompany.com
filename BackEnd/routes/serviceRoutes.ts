import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const serviceRouter = Router();

// GET /api/services
serviceRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { category, status, search } = req.query;

  let services = await db.getServices();

  if (category && typeof category === 'string' && category !== 'All') {
    services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'All') {
    services = services.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    services = services.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    );
  }

  return res.json(services);
}));

// GET /api/services/:id
serviceRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const service = await db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json(service);
}));

// POST /api/services
serviceRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const { name, category, description, image } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Missing required service fields: name, category, description' });
  }

  const newService = await db.createService({
    ...req.body,
    image: image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    status: req.body.status || 'Active'
  });

  return res.status(201).json(newService);
}));

// PUT /api/services/:id
serviceRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const updated = await db.updateService(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json(updated);
}));

// DELETE /api/services/:id
serviceRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const deleted = await db.deleteService(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json({ message: 'Service deleted successfully', id: req.params.id });
}));

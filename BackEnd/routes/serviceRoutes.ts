import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const serviceRouter = Router();

// GET /api/services
serviceRouter.get('/', (req: Request, res: Response) => {
  const { category, status, search } = req.query;

  let services = db.getServices();

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
});

// GET /api/services/:id
serviceRouter.get('/:id', (req: Request, res: Response) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json(service);
});

// POST /api/services
serviceRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const { name, category, description, image } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Missing required service fields: name, category, description' });
  }

  const newService = db.createService({
    ...req.body,
    image: image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    status: req.body.status || 'Active'
  });

  return res.status(201).json(newService);
});

// PUT /api/services/:id
serviceRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const updated = db.updateService(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json(updated);
});

// DELETE /api/services/:id
serviceRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const deleted = db.deleteService(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  return res.json({ message: 'Service deleted successfully', id: req.params.id });
});

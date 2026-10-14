import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const statsRouter = Router();

// GET /api/stats (Admin overview stats)
statsRouter.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const [properties, services, agencies, blogs, users] = await Promise.all([
    db.getProperties(), db.getServices(), db.getAgencies(), db.getBlogs(), db.getUsers(),
  ]);

  const totalPortfolioValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);

  return res.json({
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'Active').length,
    totalPortfolioValue,
    totalServices: services.length,
    totalAgencies: agencies.length,
    verifiedAgencies: agencies.filter(a => a.verified).length,
    totalBlogs: blogs.length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    propertiesByType: {
      residential: properties.filter(p => p.property_type === 'Residential').length,
      commercial: properties.filter(p => p.property_type === 'Commercial').length,
      apartment: properties.filter(p => p.property_type === 'Apartment').length,
      villa: properties.filter(p => p.property_type === 'Villa').length,
      plot: properties.filter(p => p.property_type === 'Plot').length,
    }
  });
}));

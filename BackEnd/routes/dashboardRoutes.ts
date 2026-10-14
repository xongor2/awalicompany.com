import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get('/stats', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user?.role === 'Agency' ? req.user.id : undefined;
  return res.json(await db.getDashboardStats(ownerId));
}));

// GET /api/dashboard/recent-properties
dashboardRouter.get('/recent-properties', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user?.role === 'Agency' ? req.user.id : undefined;
  return res.json(await db.getRecentProperties(5, ownerId));
}));

// GET /api/dashboard/recent-users
dashboardRouter.get('/recent-users', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'Agency') return res.json([]);
  return res.json(await db.getRecentUsers(5));
}));

// GET /api/dashboard/chart
dashboardRouter.get('/chart', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user?.role === 'Agency' ? req.user.id : undefined;
  return res.json(await db.getListingsOverviewChart(ownerId));
}));

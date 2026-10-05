import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get('/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getDashboardStats());
});

// GET /api/dashboard/recent-properties
dashboardRouter.get('/recent-properties', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getRecentProperties(5));
});

// GET /api/dashboard/recent-users
dashboardRouter.get('/recent-users', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getRecentUsers(5));
});

// GET /api/dashboard/chart
dashboardRouter.get('/chart', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getListingsOverviewChart());
});

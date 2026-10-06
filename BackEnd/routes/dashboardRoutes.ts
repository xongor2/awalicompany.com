import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get('/stats', authMiddleware, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => res.json(await db.getDashboardStats())));

// GET /api/dashboard/recent-properties
dashboardRouter.get('/recent-properties', authMiddleware, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => res.json(await db.getRecentProperties(5))));

// GET /api/dashboard/recent-users
dashboardRouter.get('/recent-users', authMiddleware, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => res.json(await db.getRecentUsers(5))));

// GET /api/dashboard/chart
dashboardRouter.get('/chart', authMiddleware, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => res.json(await db.getListingsOverviewChart())));

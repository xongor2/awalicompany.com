import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { CommissionService } from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const commissionRouter = Router();

const SERVICES: CommissionService[] = ['Health', 'Education', 'Real Estate', 'Consulting'];
const ALL_SERVICES = 'All Services' as const;
type CommissionInputService = CommissionService | typeof ALL_SERVICES;

commissionRouter.use(authMiddleware);

const requireAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
  if (req.user?.role === 'Admin') return true;
  res.status(403).json({ error: 'Forbidden: Admin access required.' });
  return false;
};

const parseCommission = (
  value: unknown,
  allowAllServices = false,
): { service: CommissionInputService; percentage: number } | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const service = item.service as CommissionInputService;
  const percentage = Number(item.percentage);
  const hasValidService = SERVICES.includes(service as CommissionService)
    || (allowAllServices && service === ALL_SERVICES);
  if (!hasValidService || !Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    return null;
  }
  return { service, percentage };
};

commissionRouter.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot view commissions.' });
  }
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 191) : undefined;
  const service = typeof req.query.service === 'string' ? req.query.service : undefined;
  return res.json(await db.getCommissions({
    search,
    service,
    userId: req.user.role === 'Agency' ? req.user.id : undefined,
  }));
}));

commissionRouter.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';
  const requested: unknown[] = Array.isArray(req.body?.commissions) ? req.body.commissions : [];
  if (!userId || requested.length === 0 || requested.length > SERVICES.length) {
    return res.status(400).json({ error: 'Select an Agency user and add at least one commission.' });
  }

  const user = await db.getUserById(userId);
  if (!user || user.role !== 'Agency') {
    return res.status(400).json({ error: 'Commissions can only be assigned to users with the Agency role.' });
  }

  const commissions = requested.map(item => parseCommission(item, true));
  if (commissions.some(item => item === null)) {
    return res.status(400).json({ error: 'Each commission needs a valid service and a percentage from 0.01 to 100.' });
  }
  const validCommissions = commissions as Array<{ service: CommissionInputService; percentage: number }>;
  const includesAllServices = validCommissions.some(item => item.service === ALL_SERVICES);
  if (includesAllServices && validCommissions.length > 1) {
    return res.status(400).json({ error: 'All Services must be used by itself because it applies the percentage to every service.' });
  }

  const expandedCommissions: Array<{ service: CommissionService; percentage: number }> = validCommissions.flatMap(item =>
    item.service === ALL_SERVICES
      ? SERVICES.map(service => ({ service, percentage: item.percentage }))
      : [{ service: item.service, percentage: item.percentage }]
  );
  if (new Set(expandedCommissions.map(item => item.service)).size !== expandedCommissions.length) {
    return res.status(400).json({ error: 'Each service can only be added once for the selected user.' });
  }

  return res.status(201).json(await db.createCommissions(userId, expandedCommissions));
}));

commissionRouter.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const commission = parseCommission(req.body);
  if (!commission || commission.service === ALL_SERVICES) {
    return res.status(400).json({ error: 'Select a valid service and enter a percentage from 0.01 to 100.' });
  }
  try {
    const updated = await db.updateCommission(req.params.id, {
      service: commission.service,
      percentage: commission.percentage,
    });
    if (!updated) return res.status(404).json({ error: 'Commission not found.' });
    return res.json(updated);
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This user already has a commission for that service.' });
    }
    throw error;
  }
}));

commissionRouter.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  if (!await db.deleteCommission(req.params.id)) {
    return res.status(404).json({ error: 'Commission not found.' });
  }
  return res.json({ message: 'Commission deleted successfully.', id: req.params.id });
}));

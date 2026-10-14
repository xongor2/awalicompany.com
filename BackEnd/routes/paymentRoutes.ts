import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const paymentRouter = Router();

paymentRouter.use(authMiddleware);

// Payments are calculated from completed customer amounts and the commission
// configured for that Agency user and service.
paymentRouter.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot view Agency payments.' });
  }

  return res.json(await db.getAgencyPayments({
    userId: req.user.role === 'Agency' ? req.user.id : undefined,
  }));
}));

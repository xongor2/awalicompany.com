import { Router, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { CustomerService } from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const customerRouter = Router();

const SERVICES: CustomerService[] = ['Health', 'Education', 'Real Estate', 'Consulting'];
const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const payloadFromRequest = (body: Record<string, unknown>) => {
  const amountValue = body.amount === '' || body.amount == null ? null : Number(body.amount);
  return {
    fullName: text(body.fullName, 180),
    email: text(body.email, 191),
    phone: text(body.phone, 50),
    country: text(body.country, 100),
    city: text(body.city, 100),
    service: SERVICES.includes(body.service as CustomerService) ? body.service as CustomerService : null,
    serviceInfo: text(body.serviceInfo, 10_000),
    amount: amountValue,
    receipt: text(body.receipt, 8_000_000),
  };
};

const validationError = (payload: ReturnType<typeof payloadFromRequest>): string | null => {
  if (!payload.fullName || !payload.phone || !payload.service) {
    return 'Full name, phone number, and service are required.';
  }
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Enter a valid email address.';
  }
  if (payload.amount !== null && (!Number.isFinite(payload.amount) || payload.amount < 0 || payload.amount > 1_000_000_000)) {
    return 'Enter a valid amount.';
  }
  if (payload.receipt && !payload.receipt.startsWith('data:image/')) {
    return 'The receipt must be a valid image.';
  }
  return null;
};

customerRouter.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot view customers.' });
  }
  return res.json(await db.getCustomers(req.user.role === 'Agency' ? { createdByUserId: req.user.id } : undefined));
}));

customerRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot add customers.' });
  }
  const payload = payloadFromRequest(req.body || {});
  const error = validationError(payload);
  if (error) return res.status(400).json({ error });
  return res.status(201).json(await db.createCustomer({
    ...payload,
    service: payload.service!,
    createdByUserId: req.user!.id,
  }));
}));

customerRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot update customers.' });
  }
  const current = await db.getCustomerById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Customer not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only update customers you created.' });
  }
  const payload = payloadFromRequest({ ...current, ...req.body });
  const error = validationError(payload);
  if (error) return res.status(400).json({ error });
  return res.json(await db.updateCustomer(req.params.id, { ...payload, service: payload.service! }));
}));

customerRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !['Admin', 'Agency'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: This account cannot delete customers.' });
  }
  const current = await db.getCustomerById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Customer not found.' });
  if (req.user.role === 'Agency' && current.createdByUserId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only delete customers you created.' });
  }
  if (!await db.deleteCustomer(req.params.id)) return res.status(404).json({ error: 'Customer not found.' });
  return res.json({ message: 'Customer deleted successfully.', id: req.params.id });
}));

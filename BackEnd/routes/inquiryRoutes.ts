import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const inquiryRouter = Router();

// POST /api/inquiries
inquiryRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { type, name, email, phone, details } = req.body;
  if (!name || !email || !details) {
    return res.status(400).json({ error: 'Name, email, and message details are required.' });
  }

  const newInquiry = await db.createInquiry({
    type: type || 'General',
    name,
    email,
    phone: phone || '',
    details,
  });

  return res.status(201).json({
    message: 'Your inquiry has been received. Our team will contact you shortly.',
    inquiry: newInquiry
  });
}));

// GET /api/inquiries
inquiryRouter.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  return res.json(await db.getInquiries());
}));

// POST /api/newsletter/subscribe
inquiryRouter.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  await db.subscribe(email);

  return res.status(201).json({
    message: 'Thank you for subscribing to AW Ali updates and insights.',
    email
  });
}));

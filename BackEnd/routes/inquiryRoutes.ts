import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export const inquiryRouter = Router();

// In-memory inquiries store for web form submissions
const inquiries: any[] = [];
const subscribers: Set<string> = new Set();

// POST /api/inquiries
inquiryRouter.post('/', (req: Request, res: Response) => {
  const { type, name, email, phone, details } = req.body;
  if (!name || !email || !details) {
    return res.status(400).json({ error: 'Name, email, and message details are required.' });
  }

  const newInquiry = {
    id: `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    type: type || 'General',
    name,
    email,
    phone: phone || '',
    details,
    status: 'New',
    created_at: new Date().toISOString()
  };

  inquiries.push(newInquiry);

  return res.status(201).json({
    message: 'Your inquiry has been received. Our team will contact you shortly.',
    inquiry: newInquiry
  });
});

// GET /api/inquiries
inquiryRouter.get('/', (req: Request, res: Response) => {
  return res.json(inquiries);
});

// POST /api/newsletter/subscribe
inquiryRouter.post('/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  subscribers.add(email);

  return res.status(201).json({
    message: 'Thank you for subscribing to AW Ali updates and insights.',
    email
  });
});

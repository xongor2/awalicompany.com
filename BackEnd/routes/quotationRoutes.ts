import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type { QuotationCurrency, QuotationItem, QuotationStatus } from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const quotationRouter = Router();

const VALID_STATUSES: QuotationStatus[] = ['Draft', 'Sent', 'Accepted', 'Expired'];
const VALID_CURRENCIES: QuotationCurrency[] = ['USD', 'EUR', 'GBP', 'TRY'];

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const positiveInteger = (value: unknown, fallback: number): number => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= 365 ? number : fallback;
};

const dateValue = (value: unknown): string | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
};

const normalizeItems = (value: unknown): QuotationItem[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const candidate = entry as Record<string, unknown>;
    const service = text(candidate.service, 255);
    const description = text(candidate.description, 1_000);
    const quantity = Number(candidate.quantity);
    const unitPrice = Number(candidate.unitPrice);
    if (!service || !Number.isFinite(quantity) || quantity <= 0 || quantity > 100_000 ||
      !Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000_000) return [];
    return [{
      id: text(candidate.id, 100) || `item-${index + 1}`,
      service,
      description,
      quantity: Math.round(quantity * 100) / 100,
      unitPrice: Math.round(unitPrice * 100) / 100,
    }];
  });
};

const payloadFromRequest = (body: Record<string, unknown>) => ({
  quotationNumber: text(body.quotationNumber, 100),
  customerName: text(body.customerName, 180),
  customerEmail: text(body.customerEmail, 191),
  customerPhone: text(body.customerPhone, 50),
  quotationDate: dateValue(body.quotationDate),
  validityDays: positiveInteger(body.validityDays, 15),
  currency: VALID_CURRENCIES.includes(body.currency as QuotationCurrency)
    ? body.currency as QuotationCurrency
    : null,
  status: VALID_STATUSES.includes(body.status as QuotationStatus)
    ? body.status as QuotationStatus
    : null,
  items: normalizeItems(body.items),
  terms: text(body.terms, 10_000),
  notes: text(body.notes, 10_000),
  preparedBy: text(body.preparedBy, 180),
});

const validationError = (payload: ReturnType<typeof payloadFromRequest>): string | null => {
  if (!payload.quotationNumber || !payload.customerName || !payload.quotationDate ||
    !payload.currency || !payload.status || !payload.preparedBy || payload.items.length === 0) {
    return 'Quotation number, customer, date, currency, status, prepared by, and at least one valid service item are required.';
  }
  if (payload.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail)) {
    return 'Enter a valid customer email address.';
  }
  return null;
};

quotationRouter.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  let quotations = await db.getQuotations();
  if (search) {
    quotations = quotations.filter(item =>
      item.quotationNumber.toLowerCase().includes(search) ||
      item.customerName.toLowerCase().includes(search) ||
      item.customerEmail.toLowerCase().includes(search) ||
      item.items.some(line => line.service.toLowerCase().includes(search)),
    );
  }
  if (status && VALID_STATUSES.includes(status as QuotationStatus)) {
    quotations = quotations.filter(item => item.status === status);
  }
  return res.json(quotations);
}));

quotationRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const payload = payloadFromRequest(req.body || {});
  const error = validationError(payload);
  if (error) return res.status(400).json({ error });
  if (await db.getQuotationByNumber(payload.quotationNumber)) {
    return res.status(409).json({ error: 'This quotation number is already in use.' });
  }
  return res.status(201).json(await db.createQuotation({
    ...payload,
    quotationDate: payload.quotationDate!,
    currency: payload.currency!,
    status: payload.status!,
  }));
}));

quotationRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const current = await db.getQuotationById(req.params.id);
  if (!current) return res.status(404).json({ error: 'Quotation not found.' });

  const payload = payloadFromRequest({ ...current, ...req.body });
  const error = validationError(payload);
  if (error) return res.status(400).json({ error });
  const duplicate = await db.getQuotationByNumber(payload.quotationNumber);
  if (duplicate && duplicate.id !== req.params.id) {
    return res.status(409).json({ error: 'This quotation number is already in use.' });
  }
  return res.json(await db.updateQuotation(req.params.id, {
    ...payload,
    quotationDate: payload.quotationDate!,
    currency: payload.currency!,
    status: payload.status!,
  }));
}));

quotationRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  if (!await db.deleteQuotation(req.params.id)) {
    return res.status(404).json({ error: 'Quotation not found.' });
  }
  return res.json({ message: 'Quotation deleted successfully.', id: req.params.id });
}));

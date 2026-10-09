import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import type {
  QuickPopup,
  QuickPopupDelayUnit,
  QuickPopupDesign,
  QuickPopupDisplayPage,
  QuickPopupRepeatUnit,
  QuickPopupStatus,
  QuickPopupType,
} from '../../DataBase/models.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const quickPopupRouter = Router();

const POPUP_TYPES: QuickPopupType[] = ['Right Sidebar', 'Screen Modal'];
const DESIGN_TYPES: QuickPopupDesign[] = ['Image', 'Custom Content'];
const DISPLAY_PAGES: QuickPopupDisplayPage[] = ['Home', 'Academic', 'Courses', 'Admissions', 'News', 'About Us', 'Contact'];
const DELAY_UNITS: QuickPopupDelayUnit[] = ['Seconds', 'Minutes'];
const REPEAT_UNITS: QuickPopupRepeatUnit[] = ['Hours', 'Days'];
const STATUSES: QuickPopupStatus[] = ['Active', 'Inactive'];

const canManage = (req: AuthenticatedRequest) => req.user?.role === 'Admin';
const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const optionalText = (value: unknown, maxLength: number): string | null => {
  const result = text(value, maxLength);
  return result || null;
};

const enumValue = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === 'string' && allowed.includes(value as T) ? value as T : null;

const integer = (value: unknown, minimum: number, maximum: number, optional = false): number | null => {
  if (optional && (value === '' || value === null || value === undefined)) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
};

const httpUrl = (value: unknown): string | null => {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const supportedImage = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(value.trim());
  if (!match) return null;
  try {
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length === 0 || bytes.length > 4 * 1024 * 1024) return null;
    const mime = match[1].toLowerCase();
    const isPng = mime === 'png' && bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpeg = (mime === 'jpg' || mime === 'jpeg') && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isWebp = mime === 'webp' && bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
    return isPng || isJpeg || isWebp ? value.trim() : null;
  } catch {
    return null;
  }
};

type PopupInput = Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>;

const parsePopup = (body: any): { data?: PopupInput; error?: string } => {
  if (typeof body.name === 'string' && body.name.trim().length > 180) return { error: 'Popup Name must be 180 characters or fewer.' };
  const name = text(body.name, 180);
  const popupType = enumValue(body.popupType, POPUP_TYPES);
  const designType = enumValue(body.designType, DESIGN_TYPES);
  const displayPage = enumValue(body.displayPage, DISPLAY_PAGES);
  const status = enumValue(body.status, STATUSES);
  const showAfterValue = integer(body.showAfterValue, 1, 10_080, true);
  const showAfterUnit = showAfterValue === null ? null : enumValue(body.showAfterUnit, DELAY_UNITS);
  const showAfterScroll = integer(body.showAfterScroll, 1, 100, true);
  const maximumDisplays = integer(body.maximumDisplays, 1, 1_000);
  const repeatEveryValue = integer(body.repeatEveryValue, 1, 8_760);
  const repeatEveryUnit = enumValue(body.repeatEveryUnit, REPEAT_UNITS);

  if (!name) return { error: 'Popup Name is required.' };
  if (!popupType || !designType || !displayPage || !status) return { error: 'Select valid popup type, design, display page, and status values.' };
  if (body.showAfterValue !== '' && body.showAfterValue !== null && body.showAfterValue !== undefined && showAfterValue === null) {
    return { error: 'Show After must be a whole number from 1 to 10,080.' };
  }
  if (showAfterValue !== null && !showAfterUnit) return { error: 'Select Seconds or Minutes for Show After.' };
  if (body.showAfterScroll !== '' && body.showAfterScroll !== null && body.showAfterScroll !== undefined && showAfterScroll === null) {
    return { error: 'Show After Scroll must be a whole percentage from 1 to 100.' };
  }
  if (showAfterValue !== null && showAfterScroll !== null) return { error: 'Use either a time delay or a scroll trigger, not both.' };
  if (maximumDisplays === null || repeatEveryValue === null || !repeatEveryUnit) {
    return { error: 'Repeat frequency values are outside the permitted range.' };
  }

  const image = designType === 'Image' ? supportedImage(body.image) : null;
  const destinationLink = designType === 'Image' ? httpUrl(body.destinationLink) : null;
  const title = designType === 'Custom Content' ? optionalText(body.title, 220) : null;
  const contentBody = designType === 'Custom Content' ? optionalText(body.body, 10_000) : null;
  const footer = designType === 'Custom Content' ? optionalText(body.footer, 500) : null;

  if (designType === 'Image' && !image) return { error: 'Upload a valid JPG, PNG, or WebP image no larger than 4 MB.' };
  if (designType === 'Image' && body.destinationLink && !destinationLink) return { error: 'Destination Link must be a valid HTTP or HTTPS URL.' };
  if (designType === 'Custom Content' && typeof body.title === 'string' && body.title.trim().length > 220) return { error: 'Title must be 220 characters or fewer.' };
  if (designType === 'Custom Content' && typeof body.body === 'string' && body.body.trim().length > 10_000) return { error: 'Body must be 10,000 characters or fewer.' };
  if (designType === 'Custom Content' && typeof body.footer === 'string' && body.footer.trim().length > 500) return { error: 'Footer must be 500 characters or fewer.' };
  if (designType === 'Custom Content' && (!title || !contentBody)) return { error: 'Title and Body are required for Custom Content.' };

  return {
    data: {
      name, popupType, designType, image, destinationLink, title, body: contentBody, footer,
      displayPage, showAfterValue, showAfterUnit, showAfterScroll, maximumDisplays,
      repeatEveryValue, repeatEveryUnit, status,
    },
  };
};

quickPopupRouter.get('/active', asyncHandler(async (req: Request, res: Response) => {
  const displayPage = enumValue(req.query.displayPage, DISPLAY_PAGES);
  if (!displayPage) return res.status(400).json({ error: 'A valid Display Page is required.' });
  return res.json(await db.getActiveQuickPopup(displayPage));
}));

quickPopupRouter.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  return res.json(await db.getQuickPopups());
}));

quickPopupRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  const parsed = parsePopup(req.body);
  if (!parsed.data) return res.status(400).json({ error: parsed.error });
  return res.status(201).json(await db.createQuickPopup(parsed.data));
}));

quickPopupRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  if (!await db.getQuickPopupById(req.params.id)) return res.status(404).json({ error: 'Popup not found.' });
  const parsed = parsePopup(req.body);
  if (!parsed.data) return res.status(400).json({ error: parsed.error });
  return res.json(await db.updateQuickPopup(req.params.id, parsed.data));
}));

quickPopupRouter.put('/:id/status', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  const status = enumValue(req.body.status, STATUSES);
  if (!status) return res.status(400).json({ error: 'Select Active or Inactive.' });
  const updated = await db.updateQuickPopup(req.params.id, { status });
  return updated ? res.json(updated) : res.status(404).json({ error: 'Popup not found.' });
}));

quickPopupRouter.post('/:id/duplicate', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  const duplicate = await db.duplicateQuickPopup(req.params.id);
  return duplicate ? res.status(201).json(duplicate) : res.status(404).json({ error: 'Popup not found.' });
}));

quickPopupRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ error: 'Quick Pop Up permission is required.' });
  if (!await db.deleteQuickPopup(req.params.id)) return res.status(404).json({ error: 'Popup not found.' });
  return res.json({ message: 'Popup deleted successfully.', id: req.params.id });
}));

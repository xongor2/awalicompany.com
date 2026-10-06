import crypto from 'crypto';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 210_000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const modernHash = hashPassword(password, salt).hash;
  if (modernHash.length === hash.length && crypto.timingSafeEqual(Buffer.from(modernHash), Buffer.from(hash))) {
    return true;
  }

  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return legacyHash.length === hash.length
    && crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(hash));
}

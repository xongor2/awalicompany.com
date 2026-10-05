import { User } from '../types';

const PROTECTED_USER_EMAILS = new Set([
  'awalicompany2020@gmail.com',
  'halsan252@gmail.com',
]);

export const isProtectedUser = (user: Pick<User, 'email'>): boolean =>
  PROTECTED_USER_EMAILS.has(user.email.trim().toLowerCase());

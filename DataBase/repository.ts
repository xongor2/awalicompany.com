import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ResultSetHeader } from 'mysql2';
import { query } from './mysql.ts';
import { runMigrations } from './migrate.ts';
import { hashPassword } from './security.ts';
import type { Agency, BlogPost, Commission, CommissionService, Customer, EducationOpportunity, HealthSpecialty, Inquiry, Property, PropertyLocationCategory, PropertyLocationKind, Quotation, QuickPopup, QuickPopupDisplayPage, RoleDefinition, Service, User } from './models.ts';

const PROTECTED_EMAILS = new Set(['awalicompany2020@gmail.com', 'halsan252@gmail.com']);
const DEFAULT_AVATAR = '/images/avatars/nature-tree.png';

const iso = (value: unknown): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
};

const jsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const toUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password_hash: row.password_hash,
  password_salt: row.password_salt,
  role: row.role,
  status: row.status,
  profile_image: row.profile_image || DEFAULT_AVATAR,
  phone: row.phone || '',
  pageAccess: jsonArray(row.page_access),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const toProperty = (row: any): Property => ({
  ...row,
  price: Number(row.price || 0),
  bedrooms: row.bedrooms == null ? undefined : String(row.bedrooms),
  bathrooms: row.bathrooms == null ? undefined : Number(row.bathrooms),
  sqm: row.sqm == null ? undefined : Number(row.sqm),
  area_sqft: row.area_sqft == null ? undefined : Number(row.area_sqft),
  gallery: jsonArray(row.gallery),
  created_by_user_id: row.created_by_user_id || null,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const toPropertyLocationCategory = (row: any): PropertyLocationCategory => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  description: row.description || '',
  listingCount: Number(row.listing_count || 0),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toService = (row: any): Service => ({
  ...row,
  features: jsonArray(row.features),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const toEducationOpportunity = (row: any): EducationOpportunity => ({
  id: row.id,
  title: row.title,
  description: row.description,
  thumbnail: row.thumbnail || '',
  availableDegrees: jsonArray(row.available_degrees) as EducationOpportunity['availableDegrees'],
  universityUrl: row.university_url,
  createdByUserId: row.created_by_user_id || null,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toHealthSpecialty = (row: any): HealthSpecialty => ({
  id: row.id,
  category: row.category,
  name: row.name,
  country: row.country || '',
  city: row.city || '',
  tagline: row.tagline,
  description: row.description,
  keyProcedures: jsonArray(row.key_procedures),
  destinations: jsonArray(row.destinations),
  image: row.image,
  status: row.status,
  createdByUserId: row.created_by_user_id || null,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toQuotation = (row: any): Quotation => ({
  id: row.id,
  quotationNumber: row.quotation_number,
  customerName: row.customer_name,
  customerEmail: row.customer_email || '',
  customerPhone: row.customer_phone || '',
  quotationDate: row.quotation_date instanceof Date
    ? row.quotation_date.toISOString().slice(0, 10)
    : String(row.quotation_date || '').slice(0, 10),
  validityDays: Number(row.validity_days || 15),
  currency: row.currency,
  status: row.status,
  items: (() => {
    const items = jsonArray(row.items);
    return Array.isArray(row.items)
      ? row.items
      : typeof row.items === 'string'
        ? (() => { try { return JSON.parse(row.items); } catch { return []; } })()
        : items;
  })() as Quotation['items'],
  terms: row.terms || '',
  notes: row.notes || '',
  preparedBy: row.prepared_by || 'AW ALI COMPANY',
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toQuickPopup = (row: any): QuickPopup => ({
  id: row.id,
  name: row.name,
  popupType: row.popup_type,
  designType: row.design_type,
  image: row.image || null,
  destinationLink: row.destination_link || null,
  title: row.title || null,
  body: row.body || null,
  footer: row.footer || null,
  displayPage: row.display_page,
  showAfterValue: row.show_after_value == null ? null : Number(row.show_after_value),
  showAfterUnit: row.show_after_unit || null,
  showAfterScroll: row.show_after_scroll == null ? null : Number(row.show_after_scroll),
  maximumDisplays: Number(row.maximum_displays),
  repeatEveryValue: Number(row.repeat_every_value),
  repeatEveryUnit: row.repeat_every_unit,
  status: row.status,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toBlog = (row: any): BlogPost => ({
  id: row.id,
  title: row.title,
  content: row.content,
  thumbnail: row.thumbnail,
  categories: jsonArray(row.categories),
  status: row.status,
  published_date: row.published_date || '',
  author: row.author,
  views: Number(row.views || 0),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const toAgency = (row: any): Agency => ({
  id: row.id,
  userId: row.user_id || null,
  name: row.name,
  logo: row.logo || '',
  country: row.country,
  city: row.city,
  contactName: row.contact_name,
  email: row.email,
  phone: row.phone,
  website: row.website || '',
  address: row.address || '',
  verified: Boolean(row.verified),
  createdAt: iso(row.created_at),
});

const toCustomer = (row: any): Customer => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email || '',
  phone: row.phone,
  country: row.country || '',
  city: row.city || '',
  service: row.service,
  serviceInfo: row.service_info || '',
  amount: row.amount == null ? null : Number(row.amount),
  receipt: row.receipt || '',
  createdByUserId: row.created_by_user_id || null,
  createdByName: row.created_by_name || '',
  createdByEmail: row.created_by_email || '',
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toCommission = (row: any): Commission => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  service: row.service,
  percentage: Number(row.percentage),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const toRole = (row: any): RoleDefinition => ({
  id: row.id,
  name: row.name,
  description: row.description,
  type: row.type,
  pageAccess: jsonArray(row.page_access),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

async function updateColumns(
  table: string,
  id: string,
  updates: Record<string, unknown>,
  allowed: Record<string, string>,
  jsonFields: Set<string> = new Set(),
): Promise<boolean> {
  const entries = Object.entries(updates).filter(([key, value]) => key in allowed && value !== undefined);
  if (entries.length === 0) return true;
  const assignments = entries.map(([key]) => `\`${allowed[key]}\` = ?`).join(', ');
  const values = entries.map(([key, value]) => jsonFields.has(key) ? JSON.stringify(value ?? []) : value);
  const result = await query<ResultSetHeader>(`UPDATE \`${table}\` SET ${assignments} WHERE id = ?`, [...values, id]);
  return result.affectedRows > 0;
}

class MySQLRepository {
  async createSession(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt]);
    return token;
  }

  async getSessionUser(token: string): Promise<User | null> {
    const rows = await query<any[]>(
      `SELECT u.*, r.page_access
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN roles r ON r.name = u.role
       WHERE s.token = ? AND s.expires_at > NOW()
       LIMIT 1`,
      [token],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async deleteSession(token: string): Promise<void> {
    await query('DELETE FROM sessions WHERE token = ?', [token]);
  }

  async getUsers(filter?: { search?: string; role?: string; status?: string }): Promise<User[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter?.search) {
      where.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }
    if (filter?.role && filter.role !== 'All') { where.push('role = ?'); params.push(filter.role); }
    if (filter?.status && filter.status !== 'All') { where.push('status = ?'); params.push(filter.status); }
    const rows = await query<any[]>(`SELECT * FROM users ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`, params);
    return rows.map(toUser);
  }

  async getUserById(id: string): Promise<User | null> {
    const rows = await query<any[]>(
      'SELECT u.*, r.page_access FROM users u LEFT JOIN roles r ON r.name = u.role WHERE u.id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await query<any[]>(
      'SELECT u.*, r.page_access FROM users u LEFT JOIN roles r ON r.name = u.role WHERE LOWER(u.email) = LOWER(?) LIMIT 1',
      [email],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async createUser(data: {
    name: string; email: string; password: string; role?: User['role']; status?: User['status']; profile_image?: string; phone?: string;
  }): Promise<User> {
    const email = data.email.trim().toLowerCase();
    if (await this.getUserByEmail(email)) throw new Error('An account with this email already exists.');
    const { hash, salt } = hashPassword(data.password);
    const id = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO users (id, name, email, password_hash, password_salt, role, status, profile_image, phone, protected_account)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, email, hash, salt, data.role || 'Client', data.status || 'Active', data.profile_image || DEFAULT_AVATAR, data.phone || '', PROTECTED_EMAILS.has(email)],
    );
    return (await this.getUserById(id))!;
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role' | 'status' | 'profile_image' | 'phone'>>): Promise<User | null> {
    const current = await this.getUserById(id);
    if (!current) return null;
    const next = { ...updates };
    if (next.email) next.email = next.email.trim().toLowerCase();
    await updateColumns('users', id, next, {
      name: 'name', email: 'email', role: 'role', status: 'status', profile_image: 'profile_image', phone: 'phone',
    });
    return this.getUserById(id);
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const { hash, salt } = hashPassword(newPassword);
    const result = await query<ResultSetHeader>('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?', [hash, salt, id]);
    return result.affectedRows > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    const rows = await query<any[]>('SELECT email, protected_account FROM users WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return false;
    if (rows[0].protected_account || PROTECTED_EMAILS.has(String(rows[0].email).toLowerCase())) {
      throw new Error('This primary administrator account is protected and cannot be deleted.');
    }
    const result = await query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async getProperties(filter?: { createdByUserId?: string }): Promise<Property[]> {
    const where = filter?.createdByUserId ? 'WHERE created_by_user_id = ?' : '';
    const params = filter?.createdByUserId ? [filter.createdByUserId] : [];
    return (await query<any[]>(`SELECT * FROM properties ${where} ORDER BY created_at DESC`, params)).map(toProperty);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const rows = await query<any[]>('SELECT * FROM properties WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toProperty(rows[0]) : null;
  }

  async createProperty(data: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const id = `prop-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO properties (id,title,description,property_type,location,price,image,status,address,buy_rent,bedrooms,bathrooms,balcony,sqm,area_sqft,street,furnishing_status,shopping,masjid,payment,gallery,created_by_user_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,data.title,data.description,data.property_type,data.location,data.price,data.image,data.status,data.address || null,data.buy_rent || null,data.bedrooms ?? null,data.bathrooms ?? null,data.balcony || null,data.sqm ?? null,data.area_sqft ?? null,data.street || null,data.furnishing_status || null,data.shopping || null,data.masjid || null,data.payment || null,JSON.stringify(data.gallery || []),data.created_by_user_id || null],
    );
    return (await this.getPropertyById(id))!;
  }

  async updateProperty(id: string, updates: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>): Promise<Property | null> {
    if (!await this.getPropertyById(id)) return null;
    await updateColumns('properties', id, updates, {
      title:'title',description:'description',property_type:'property_type',location:'location',price:'price',image:'image',status:'status',address:'address',buy_rent:'buy_rent',bedrooms:'bedrooms',bathrooms:'bathrooms',balcony:'balcony',sqm:'sqm',area_sqft:'area_sqft',street:'street',furnishing_status:'furnishing_status',shopping:'shopping',masjid:'masjid',payment:'payment',gallery:'gallery',
    }, new Set(['gallery']));
    return this.getPropertyById(id);
  }

  async deleteProperty(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM properties WHERE id = ?', [id])).affectedRows > 0;
  }

  async getPropertyLocationCategories(kind: PropertyLocationKind): Promise<PropertyLocationCategory[]> {
    const rows = await query<any[]>(
      `SELECT category.*, COUNT(p.id) AS listing_count
       FROM property_location_categories category
       LEFT JOIN properties p ON p.location LIKE CONCAT('%', category.name, '%')
       WHERE category.kind = ?
       GROUP BY category.id, category.kind, category.name, category.description, category.created_at, category.updated_at
       ORDER BY category.name`,
      [kind],
    );
    return rows.map(toPropertyLocationCategory);
  }

  async getPropertyLocationCategory(id: string): Promise<PropertyLocationCategory | null> {
    const rows = await query<any[]>(
      `SELECT category.*, COUNT(p.id) AS listing_count
       FROM property_location_categories category
       LEFT JOIN properties p ON p.location LIKE CONCAT('%', category.name, '%')
       WHERE category.id = ?
       GROUP BY category.id, category.kind, category.name, category.description, category.created_at, category.updated_at
       LIMIT 1`,
      [id],
    );
    return rows[0] ? toPropertyLocationCategory(rows[0]) : null;
  }

  async createPropertyLocationCategory(
    kind: PropertyLocationKind,
    data: Pick<PropertyLocationCategory, 'name' | 'description'>,
  ): Promise<PropertyLocationCategory> {
    const name = data.name.trim();
    if (!name) throw new Error(`${kind} name is required.`);
    const duplicate = await query<any[]>(
      'SELECT id FROM property_location_categories WHERE kind = ? AND LOWER(name) = LOWER(?) LIMIT 1',
      [kind, name],
    );
    if (duplicate.length) throw new Error(`${kind} already exists.`);
    const id = `location-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      'INSERT INTO property_location_categories (id, kind, name, description) VALUES (?, ?, ?, ?)',
      [id, kind, name, data.description?.trim() || ''],
    );
    return (await this.getPropertyLocationCategory(id))!;
  }

  async ensurePropertyLocationCategory(
    kind: PropertyLocationKind,
    rawName: string,
  ): Promise<PropertyLocationCategory> {
    const name = rawName.trim();
    if (!name) throw new Error(`${kind} name is required.`);
    const id = `location-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO property_location_categories (id, kind, name, description)
       VALUES (?, ?, ?, '')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [id, kind, name],
    );
    const rows = await query<any[]>(
      'SELECT id FROM property_location_categories WHERE kind = ? AND LOWER(name) = LOWER(?) LIMIT 1',
      [kind, name],
    );
    return (await this.getPropertyLocationCategory(rows[0].id))!;
  }

  async updatePropertyLocationCategory(
    id: string,
    data: Partial<Pick<PropertyLocationCategory, 'name' | 'description'>>,
  ): Promise<PropertyLocationCategory | null> {
    const current = await this.getPropertyLocationCategory(id);
    if (!current) return null;
    const name = data.name?.trim() || current.name;
    const duplicate = await query<any[]>(
      'SELECT id FROM property_location_categories WHERE kind = ? AND LOWER(name) = LOWER(?) AND id <> ? LIMIT 1',
      [current.kind, name, id],
    );
    if (duplicate.length) throw new Error(`${current.kind} already exists.`);
    await updateColumns('property_location_categories', id, { ...data, name }, {
      name: 'name', description: 'description',
    });
    return this.getPropertyLocationCategory(id);
  }

  async deletePropertyLocationCategory(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM property_location_categories WHERE id = ?', [id])).affectedRows > 0;
  }

  async getServices(): Promise<Service[]> {
    return (await query<any[]>('SELECT * FROM services ORDER BY created_at DESC')).map(toService);
  }

  async getServiceById(id: string): Promise<Service | null> {
    const rows = await query<any[]>('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toService(rows[0]) : null;
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const id = `srv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query('INSERT INTO services (id,name,category,description,image,status,features) VALUES (?,?,?,?,?,?,?)',
      [id,data.name,data.category,data.description,data.image,data.status,JSON.stringify(data.features || [])]);
    return (await this.getServiceById(id))!;
  }

  async updateService(id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service | null> {
    if (!await this.getServiceById(id)) return null;
    await updateColumns('services', id, updates, {name:'name',category:'category',description:'description',image:'image',status:'status',features:'features'}, new Set(['features']));
    return this.getServiceById(id);
  }

  async deleteService(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM services WHERE id = ?', [id])).affectedRows > 0;
  }

  async getEducationOpportunities(filter?: { createdByUserId?: string }): Promise<EducationOpportunity[]> {
    const where = filter?.createdByUserId ? 'WHERE created_by_user_id = ?' : '';
    const params = filter?.createdByUserId ? [filter.createdByUserId] : [];
    return (await query<any[]>(`SELECT * FROM education_opportunities ${where} ORDER BY created_at DESC`, params)).map(toEducationOpportunity);
  }

  async getEducationOpportunityById(id: string): Promise<EducationOpportunity | null> {
    const rows = await query<any[]>('SELECT * FROM education_opportunities WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toEducationOpportunity(rows[0]) : null;
  }

  async createEducationOpportunity(
    data: Omit<EducationOpportunity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<EducationOpportunity> {
    const id = `edu-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      'INSERT INTO education_opportunities (id, title, description, thumbnail, available_degrees, university_url, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.title, data.description, data.thumbnail, JSON.stringify(data.availableDegrees), data.universityUrl, data.createdByUserId],
    );
    return (await this.getEducationOpportunityById(id))!;
  }

  async updateEducationOpportunity(
    id: string,
    updates: Partial<Omit<EducationOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'>>,
  ): Promise<EducationOpportunity | null> {
    if (!await this.getEducationOpportunityById(id)) return null;
    await updateColumns(
      'education_opportunities',
      id,
      updates,
      {
        title: 'title',
        description: 'description',
        thumbnail: 'thumbnail',
        availableDegrees: 'available_degrees',
        universityUrl: 'university_url',
      },
      new Set(['availableDegrees']),
    );
    return this.getEducationOpportunityById(id);
  }

  async deleteEducationOpportunity(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM education_opportunities WHERE id = ?', [id])).affectedRows > 0;
  }

  async getHealthSpecialties(filter?: { createdByUserId?: string }): Promise<HealthSpecialty[]> {
    const where = filter?.createdByUserId ? 'WHERE created_by_user_id = ?' : '';
    const params = filter?.createdByUserId ? [filter.createdByUserId] : [];
    return (await query<any[]>(`SELECT * FROM health_specialties ${where} ORDER BY created_at DESC`, params)).map(toHealthSpecialty);
  }

  async getHealthSpecialtyById(id: string): Promise<HealthSpecialty | null> {
    const rows = await query<any[]>('SELECT * FROM health_specialties WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toHealthSpecialty(rows[0]) : null;
  }

  async createHealthSpecialty(
    data: Omit<HealthSpecialty, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<HealthSpecialty> {
    const id = `health-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      'INSERT INTO health_specialties (id, category, name, country, city, tagline, description, key_procedures, destinations, image, status, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.category, data.name, data.country, data.city, data.tagline, data.description, JSON.stringify(data.keyProcedures), JSON.stringify(data.destinations), data.image, data.status, data.createdByUserId],
    );
    return (await this.getHealthSpecialtyById(id))!;
  }

  async updateHealthSpecialty(
    id: string,
    updates: Partial<Omit<HealthSpecialty, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'>>,
  ): Promise<HealthSpecialty | null> {
    if (!await this.getHealthSpecialtyById(id)) return null;
    await updateColumns(
      'health_specialties',
      id,
      updates,
      {
        category: 'category', name: 'name', country: 'country', city: 'city', tagline: 'tagline', description: 'description',
        keyProcedures: 'key_procedures', destinations: 'destinations', image: 'image', status: 'status',
      },
      new Set(['keyProcedures', 'destinations']),
    );
    return this.getHealthSpecialtyById(id);
  }

  async deleteHealthSpecialty(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM health_specialties WHERE id = ?', [id])).affectedRows > 0;
  }

  async getQuotations(): Promise<Quotation[]> {
    return (await query<any[]>('SELECT * FROM quotations ORDER BY quotation_date DESC, created_at DESC')).map(toQuotation);
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    const rows = await query<any[]>('SELECT * FROM quotations WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toQuotation(rows[0]) : null;
  }

  async getQuotationByNumber(quotationNumber: string): Promise<Quotation | null> {
    const rows = await query<any[]>('SELECT * FROM quotations WHERE LOWER(quotation_number) = LOWER(?) LIMIT 1', [quotationNumber]);
    return rows[0] ? toQuotation(rows[0]) : null;
  }

  async createQuotation(
    data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Quotation> {
    const id = `quotation-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO quotations
       (id, quotation_number, customer_name, customer_email, customer_phone, quotation_date,
        validity_days, currency, status, items, terms, notes, prepared_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.quotationNumber, data.customerName, data.customerEmail, data.customerPhone,
        data.quotationDate, data.validityDays, data.currency, data.status, JSON.stringify(data.items),
        data.terms, data.notes, data.preparedBy,
      ],
    );
    return (await this.getQuotationById(id))!;
  }

  async updateQuotation(
    id: string,
    updates: Partial<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Quotation | null> {
    if (!await this.getQuotationById(id)) return null;
    await updateColumns(
      'quotations',
      id,
      updates,
      {
        quotationNumber: 'quotation_number', customerName: 'customer_name', customerEmail: 'customer_email',
        customerPhone: 'customer_phone', quotationDate: 'quotation_date', validityDays: 'validity_days',
        currency: 'currency', status: 'status', items: 'items', terms: 'terms', notes: 'notes',
        preparedBy: 'prepared_by',
      },
      new Set(['items']),
    );
    return this.getQuotationById(id);
  }

  async deleteQuotation(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM quotations WHERE id = ?', [id])).affectedRows > 0;
  }

  async getQuickPopups(): Promise<QuickPopup[]> {
    return (await query<any[]>('SELECT * FROM quick_popups ORDER BY created_at DESC')).map(toQuickPopup);
  }

  async getQuickPopupById(id: string): Promise<QuickPopup | null> {
    const rows = await query<any[]>('SELECT * FROM quick_popups WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toQuickPopup(rows[0]) : null;
  }

  async getActiveQuickPopup(displayPage: QuickPopupDisplayPage): Promise<QuickPopup | null> {
    const rows = await query<any[]>(
      "SELECT * FROM quick_popups WHERE display_page = ? AND status = 'Active' ORDER BY updated_at DESC LIMIT 1",
      [displayPage],
    );
    return rows[0] ? toQuickPopup(rows[0]) : null;
  }

  async createQuickPopup(data: Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickPopup> {
    const id = `popup-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO quick_popups
       (id, name, popup_type, design_type, image, destination_link, title, body, footer, display_page,
        show_after_value, show_after_unit, show_after_scroll, maximum_displays, repeat_every_value,
        repeat_every_unit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name, data.popupType, data.designType, data.image, data.destinationLink, data.title,
        data.body, data.footer, data.displayPage, data.showAfterValue, data.showAfterUnit,
        data.showAfterScroll, data.maximumDisplays, data.repeatEveryValue, data.repeatEveryUnit, data.status,
      ],
    );
    return (await this.getQuickPopupById(id))!;
  }

  async updateQuickPopup(
    id: string,
    updates: Partial<Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<QuickPopup | null> {
    if (!await this.getQuickPopupById(id)) return null;
    await updateColumns('quick_popups', id, updates, {
      name: 'name', popupType: 'popup_type', designType: 'design_type', image: 'image',
      destinationLink: 'destination_link', title: 'title', body: 'body', footer: 'footer',
      displayPage: 'display_page', showAfterValue: 'show_after_value', showAfterUnit: 'show_after_unit',
      showAfterScroll: 'show_after_scroll', maximumDisplays: 'maximum_displays',
      repeatEveryValue: 'repeat_every_value', repeatEveryUnit: 'repeat_every_unit', status: 'status',
    });
    await query('UPDATE quick_popups SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [id]);
    return this.getQuickPopupById(id);
  }

  async duplicateQuickPopup(id: string): Promise<QuickPopup | null> {
    const current = await this.getQuickPopupById(id);
    if (!current) return null;
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = current;
    return this.createQuickPopup({ ...copy, name: `${copy.name} Copy`.slice(0, 180), status: 'Inactive' });
  }

  async deleteQuickPopup(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM quick_popups WHERE id = ?', [id])).affectedRows > 0;
  }

  async getBlogs(filter?: { search?: string; category?: string; status?: string }): Promise<BlogPost[]> {
    let blogs = (await query<any[]>('SELECT * FROM blogs ORDER BY created_at DESC')).map(toBlog);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      blogs = blogs.filter(item => item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q));
    }
    if (filter?.category && filter.category !== 'All') blogs = blogs.filter(item => item.categories.includes(filter.category!));
    if (filter?.status && filter.status !== 'All') blogs = blogs.filter(item => item.status === filter.status);
    return blogs;
  }

  async getBlogById(id: string): Promise<BlogPost | null> {
    const rows = await query<any[]>('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toBlog(rows[0]) : null;
  }

  async createBlog(data: { title:string; content:string; thumbnail?:string; categories?:string[]; status?:BlogPost['status']; author?:string; published_date?:string }): Promise<BlogPost> {
    const id = `blog-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const status = data.status || 'Draft';
    const publishedDate = status === 'Published' ? (data.published_date || new Date().toISOString()) : (data.published_date || '');
    await query('INSERT INTO blogs (id,title,content,thumbnail,categories,status,published_date,author) VALUES (?,?,?,?,?,?,?,?)',
      [id,data.title,data.content,data.thumbnail || '',JSON.stringify(data.categories?.length ? data.categories : ['General']),status,publishedDate,data.author || 'AW Ali Editorial']);
    return (await this.getBlogById(id))!;
  }

  async updateBlog(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at'>>): Promise<BlogPost | null> {
    const current = await this.getBlogById(id);
    if (!current) return null;
    const next = {...updates};
    if (next.status === 'Published' && !next.published_date && !current.published_date) next.published_date = new Date().toISOString();
    await updateColumns('blogs', id, next, {title:'title',content:'content',thumbnail:'thumbnail',categories:'categories',status:'status',published_date:'published_date',author:'author',views:'views'}, new Set(['categories']));
    return this.getBlogById(id);
  }

  async deleteBlog(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM blogs WHERE id = ?', [id])).affectedRows > 0;
  }

  async getCategories(): Promise<string[]> {
    return (await query<any[]>('SELECT name FROM blog_categories ORDER BY name')).map(row => row.name);
  }

  async addCategory(name: string): Promise<{category:string; alreadyExisted:boolean}> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');
    const result = await query<ResultSetHeader>('INSERT IGNORE INTO blog_categories (name) VALUES (?)', [trimmed]);
    const rows = await query<any[]>('SELECT name FROM blog_categories WHERE LOWER(name) = LOWER(?) LIMIT 1', [trimmed]);
    return { category: rows[0]?.name || trimmed, alreadyExisted: result.affectedRows === 0 };
  }

  async getDashboardStats(createdByUserId?: string) {
    const rows = createdByUserId
      ? await query<any[]>(`SELECT
          (SELECT COUNT(*) FROM properties WHERE created_by_user_id = ?) totalProperties,
          ((SELECT COUNT(*) FROM health_specialties WHERE created_by_user_id = ?)
            + (SELECT COUNT(*) FROM education_opportunities WHERE created_by_user_id = ?)) totalServices,
          (SELECT COUNT(*) FROM customers WHERE created_by_user_id = ?) totalUsers,
          (SELECT COUNT(*) FROM properties WHERE status = 'Active' AND created_by_user_id = ?) activeListings`,
        [createdByUserId, createdByUserId, createdByUserId, createdByUserId, createdByUserId])
      : await query<any[]>(`SELECT
          (SELECT COUNT(*) FROM properties) totalProperties,
          (SELECT COUNT(*) FROM services) totalServices,
          (SELECT COUNT(*) FROM users) totalUsers,
          (SELECT COUNT(*) FROM properties WHERE status='Active') activeListings`);
    return {...rows[0], totalProperties:Number(rows[0].totalProperties), totalServices:Number(rows[0].totalServices), totalUsers:Number(rows[0].totalUsers), activeListings:Number(rows[0].activeListings), changes:{properties:'0 this month',services:'0 this month',users:'0 this month',activeListings:'0 this week'}};
  }

  async getRecentProperties(limit = 5, createdByUserId?: string): Promise<Property[]> {
    const where = createdByUserId ? 'WHERE created_by_user_id = ?' : '';
    const params = createdByUserId ? [createdByUserId, limit] : [limit];
    return (await query<any[]>(`SELECT * FROM properties ${where} ORDER BY created_at DESC LIMIT ?`, params)).map(toProperty);
  }

  async getRecentUsers(limit = 5): Promise<Omit<User, 'password_hash' | 'password_salt'>[]> {
    return (await query<any[]>('SELECT * FROM users ORDER BY created_at DESC LIMIT ?', [limit])).map(toUser).map(({password_hash,password_salt,...user}) => user);
  }

  async getListingsOverviewChart(createdByUserId?: string) {
    const rows = await query<any[]>(`SELECT DATE_FORMAT(created_at, '%Y-%m') month_key, COUNT(*) listings,
      SUM(status = 'Sold') sales FROM properties WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      ${createdByUserId ? 'AND created_by_user_id = ?' : ''}
      GROUP BY month_key ORDER BY month_key`, createdByUserId ? [createdByUserId] : []);
    const counts = new Map(rows.map(row => [row.month_key, {listings:Number(row.listings),sales:Number(row.sales)}]));
    return Array.from({length:6}, (_, index) => {
      const date = new Date(); date.setMonth(date.getMonth() - (5 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      return {month:date.toLocaleString('en-US',{month:'short'}), ...(counts.get(key) || {listings:0,sales:0})};
    });
  }

  async getAgencies(params?: {search?:string;country?:string;city?:string;verified?:string|boolean;userId?:string}): Promise<Agency[]> {
    const where = params?.userId ? 'WHERE user_id = ?' : '';
    let agencies = (await query<any[]>(`SELECT * FROM agencies ${where} ORDER BY created_at DESC`, params?.userId ? [params.userId] : [])).map(toAgency);
    if (params?.search) { const q=params.search.toLowerCase(); agencies=agencies.filter(a=>[a.name,a.country,a.city,a.contactName,a.email,a.address].some(v=>v.toLowerCase().includes(q))); }
    if (params?.country && params.country !== 'All') agencies=agencies.filter(a=>a.country.toLowerCase()===params.country!.toLowerCase());
    if (params?.city && params.city !== 'All') agencies=agencies.filter(a=>a.city.toLowerCase()===params.city!.toLowerCase());
    if (params?.verified !== undefined && params.verified !== 'All') { const value=typeof params.verified==='boolean'?params.verified:params.verified==='true'; agencies=agencies.filter(a=>a.verified===value); }
    return agencies;
  }

  async getAgencyById(id: string): Promise<Agency | null> {
    const rows=await query<any[]>('SELECT * FROM agencies WHERE id=? LIMIT 1',[id]); return rows[0]?toAgency(rows[0]):null;
  }

  async getAgencyByUserId(userId: string): Promise<Agency | null> {
    const rows=await query<any[]>('SELECT * FROM agencies WHERE user_id=? LIMIT 1',[userId]);
    return rows[0]?toAgency(rows[0]):null;
  }

  async claimAgencyByEmail(userId: string, email: string): Promise<Agency | null> {
    const owned = await this.getAgencyByUserId(userId);
    if (owned) return owned;
    const rows=await query<any[]>('SELECT id FROM agencies WHERE user_id IS NULL AND LOWER(email)=LOWER(?) ORDER BY created_at ASC LIMIT 1',[email]);
    if (!rows[0]) return null;
    await query('UPDATE agencies SET user_id=? WHERE id=? AND user_id IS NULL',[userId,rows[0].id]);
    return this.getAgencyByUserId(userId);
  }

  async createAgency(data: Omit<Agency,'id'|'createdAt'|'userId'> & {userId?: string|null}): Promise<Agency> {
    const id=`agency-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query('INSERT INTO agencies (id,user_id,name,logo,country,city,contact_name,email,phone,website,address,verified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[id,data.userId||null,data.name,data.logo||'',data.country,data.city,data.contactName,data.email,data.phone,data.website||'',data.address||'',data.verified]);
    return (await this.getAgencyById(id))!;
  }

  async updateAgency(id:string,data:Partial<Agency>):Promise<Agency|null>{
    if(!await this.getAgencyById(id))return null;
    await updateColumns('agencies',id,data,{name:'name',logo:'logo',country:'country',city:'city',contactName:'contact_name',email:'email',phone:'phone',website:'website',address:'address',verified:'verified'});
    return this.getAgencyById(id);
  }

  async deleteAgency(id:string):Promise<boolean>{return (await query<ResultSetHeader>('DELETE FROM agencies WHERE id=?',[id])).affectedRows>0;}

  async getCustomers(filter?: { createdByUserId?: string }): Promise<Customer[]> {
    const where = filter?.createdByUserId ? 'WHERE c.created_by_user_id = ?' : '';
    const params = filter?.createdByUserId ? [filter.createdByUserId] : [];
    return (await query<any[]>(
      `SELECT c.*, u.name AS created_by_name, u.email AS created_by_email
       FROM customers c
       LEFT JOIN users u ON u.id = c.created_by_user_id
       ${where}
       ORDER BY c.created_at DESC`,
      params,
    )).map(toCustomer);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const rows = await query<any[]>(
      `SELECT c.*, u.name AS created_by_name, u.email AS created_by_email
       FROM customers c
       LEFT JOIN users u ON u.id = c.created_by_user_id
       WHERE c.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ? toCustomer(rows[0]) : null;
  }

  async createCustomer(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdByName' | 'createdByEmail'>,
  ): Promise<Customer> {
    const id = `customer-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      'INSERT INTO customers (id, full_name, email, phone, country, city, service, service_info, amount, receipt, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.fullName, data.email, data.phone, data.country, data.city, data.service, data.serviceInfo, data.amount, data.receipt, data.createdByUserId],
    );
    return (await this.getCustomerById(id))!;
  }

  async updateCustomer(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'createdByName' | 'createdByEmail'>>,
  ): Promise<Customer | null> {
    if (!await this.getCustomerById(id)) return null;
    await updateColumns('customers', id, data, {
      fullName: 'full_name', email: 'email', phone: 'phone', country: 'country', city: 'city',
      service: 'service', serviceInfo: 'service_info', amount: 'amount', receipt: 'receipt',
    });
    return this.getCustomerById(id);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM customers WHERE id = ?', [id])).affectedRows > 0;
  }

  async getCommissions(filter?: { search?: string; service?: string; userId?: string }): Promise<Commission[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filter?.search) {
      where.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }
    if (filter?.service && filter.service !== 'All') {
      where.push('c.service = ?');
      params.push(filter.service);
    }
    if (filter?.userId) {
      where.push('c.user_id = ?');
      params.push(filter.userId);
    }
    const rows = await query<any[]>(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
       FROM commissions c
       JOIN users u ON u.id = c.user_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY c.created_at DESC, u.name ASC, c.service ASC`,
      params,
    );
    return rows.map(toCommission);
  }

  async getCommissionById(id: string): Promise<Commission | null> {
    const rows = await query<any[]>(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
       FROM commissions c JOIN users u ON u.id = c.user_id
       WHERE c.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ? toCommission(rows[0]) : null;
  }

  async createCommissions(
    userId: string,
    commissions: Array<{ service: CommissionService; percentage: number }>,
  ): Promise<Commission[]> {
    const values = commissions.map(item => [
      `commission-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      userId,
      item.service,
      item.percentage,
    ]);
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
    await query(
      `INSERT INTO commissions (id, user_id, service, percentage)
       VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), updated_at = CURRENT_TIMESTAMP(3)`,
      values.flat(),
    );
    return this.getCommissions({ userId });
  }

  async updateCommission(
    id: string,
    data: { service: CommissionService; percentage: number },
  ): Promise<Commission | null> {
    if (!await this.getCommissionById(id)) return null;
    await updateColumns('commissions', id, data, { service: 'service', percentage: 'percentage' });
    return this.getCommissionById(id);
  }

  async deleteCommission(id: string): Promise<boolean> {
    return (await query<ResultSetHeader>('DELETE FROM commissions WHERE id = ?', [id])).affectedRows > 0;
  }

  async getRoles():Promise<RoleDefinition[]>{return (await query<any[]>('SELECT * FROM roles ORDER BY type DESC, name')).map(toRole);}

  async createRole(data:Pick<RoleDefinition,'name'|'description'|'pageAccess'>):Promise<RoleDefinition>{
    const name=data.name?.trim(); if(!name)throw new Error('Role name is required.');
    const roles=await this.getRoles(); if(roles.some(r=>r.name.toLowerCase()===name.toLowerCase()))throw new Error('A role with this name already exists.');
    const id=`role-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query('INSERT INTO roles (id,name,description,type,page_access) VALUES (?,?,?,?,?)',[id,name,data.description?.trim()||'','Custom',JSON.stringify([...new Set(data.pageAccess||[])])]);
    return (await this.getRoles()).find(r=>r.id===id)!;
  }

  async updateRole(id:string,data:Partial<Pick<RoleDefinition,'name'|'description'|'pageAccess'>>):Promise<RoleDefinition|null>{
    const roles=await this.getRoles(); const current=roles.find(r=>r.id===id); if(!current)return null;
    const name=current.type==='System'?current.name:(data.name?.trim()||current.name);
    if(roles.some(r=>r.id!==id&&r.name.toLowerCase()===name.toLowerCase()))throw new Error('A role with this name already exists.');
    await updateColumns('roles',id,{...data,name},{name:'name',description:'description',pageAccess:'page_access'},new Set(['pageAccess']));
    return (await this.getRoles()).find(r=>r.id===id)||null;
  }

  async deleteRole(id:string):Promise<boolean>{
    const role=(await this.getRoles()).find(r=>r.id===id); if(!role)return false; if(role.type==='System')throw new Error('System roles cannot be deleted.');
    return (await query<ResultSetHeader>('DELETE FROM roles WHERE id=?',[id])).affectedRows>0;
  }

  async createInquiry(data:Omit<Inquiry,'id'|'status'|'created_at'>):Promise<Inquiry>{
    const id=`inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query('INSERT INTO inquiries (id,type,name,email,phone,subject,details) VALUES (?,?,?,?,?,?,?)',[id,data.type||'General',data.name,data.email,data.phone||'',data.subject||'',data.details]);
    const rows=await query<any[]>('SELECT * FROM inquiries WHERE id=?',[id]); const row=rows[0]; return {...row,created_at:iso(row.created_at)};
  }

  async getInquiries():Promise<Inquiry[]>{return (await query<any[]>('SELECT * FROM inquiries ORDER BY created_at DESC')).map(row=>({...row,created_at:iso(row.created_at)}));}

  async subscribe(email:string):Promise<boolean>{
    const result=await query<ResultSetHeader>('INSERT IGNORE INTO newsletter_subscribers (id,email) VALUES (?,?)',[`sub-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,email.trim().toLowerCase()]);
    return result.affectedRows>0;
  }
}

export const db = new MySQLRepository();

async function importLegacyJsonOnce():Promise<void>{
  const migration=await query<any[]>('SELECT migration_key FROM app_migrations WHERE migration_key=?',['legacy-json-v1']);
  if(migration.length)return;
  const legacyPath=path.join(process.cwd(),'DataBase','awali_database.json');
  if(fs.existsSync(legacyPath)){
    const legacy=JSON.parse(fs.readFileSync(legacyPath,'utf8'));
    for(const user of legacy.users||[]){
      const email=String(user.email||'').toLowerCase(); if(!PROTECTED_EMAILS.has(email))continue;
      await query(`INSERT IGNORE INTO users (id,name,email,password_hash,password_salt,role,status,profile_image,phone,protected_account,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,TRUE,?,?)`,[user.id,user.name,email,user.password_hash,user.password_salt,'Admin','Active',user.profile_image||DEFAULT_AVATAR,user.phone||'',new Date(user.created_at),new Date(user.updated_at)]);
    }
    for(const blog of legacy.blogs||[]){
      await query('INSERT IGNORE INTO blogs (id,title,content,thumbnail,categories,status,published_date,author,views,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[blog.id,blog.title,blog.content||'',blog.thumbnail||'',JSON.stringify(blog.categories||[]),blog.status||'Draft',blog.published_date||'',blog.author||'AW Ali Editorial',blog.views||0,new Date(blog.created_at),new Date(blog.updated_at||blog.created_at)]);
    }
    for(const agency of legacy.agencies||[]){
      await query('INSERT IGNORE INTO agencies (id,name,logo,country,city,contact_name,email,phone,website,address,verified,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[agency.id,agency.name,agency.logo||'',agency.country,agency.city,agency.contactName,agency.email,agency.phone,agency.website||'',agency.address||'',Boolean(agency.verified),new Date(agency.createdAt)]);
    }
    for(const category of legacy.categories||[]){
      await query('INSERT IGNORE INTO blog_categories (name) VALUES (?)',[category]);
    }
    for(const role of legacy.roles||[]){
      await query(`INSERT INTO roles (id,name,description,type,page_access,created_at,updated_at) VALUES (?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE description=VALUES(description), type=VALUES(type), page_access=VALUES(page_access), updated_at=VALUES(updated_at)`,
        [role.id,role.name,role.description||'',role.type||'Custom',JSON.stringify(role.pageAccess||[]),new Date(role.createdAt),new Date(role.updatedAt||role.createdAt)]);
    }
  }
  await query('INSERT INTO app_migrations (migration_key) VALUES (?)',['legacy-json-v1']);
}

async function ensureConfiguredAdmin():Promise<void>{
  const email=process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase(); const password=process.env.SEED_ADMIN_PASSWORD;
  if(!email||!password)return;
  const existing=await db.getUserByEmail(email);
  if(existing){await db.updateUser(existing.id,{role:'Admin',status:'Active'});return;}
  await db.createUser({name:process.env.SEED_ADMIN_NAME?.trim()||'Main Admin',email,password,role:'Admin',status:'Active',profile_image:DEFAULT_AVATAR});
}

export async function initializeDatabase():Promise<void>{
  await runMigrations();
  await importLegacyJsonOnce();
  await ensureConfiguredAdmin();
  await query('DELETE FROM sessions WHERE expires_at <= NOW()');
  console.log('[DataBase] MySQL schema and production data are ready.');
}

export type { User, Property, PropertyLocationCategory, PropertyLocationKind, Service, EducationOpportunity, HealthSpecialty, Quotation, QuickPopup, BlogPost, Agency, Customer, Commission, CommissionService, RoleDefinition, Inquiry } from './models.ts';
export { verifyPassword } from './security.ts';

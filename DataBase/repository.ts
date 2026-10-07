import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ResultSetHeader } from 'mysql2';
import { query } from './mysql.ts';
import { runMigrations } from './migrate.ts';
import { hashPassword } from './security.ts';
import type { Agency, BlogPost, Inquiry, Property, PropertyLocationCategory, PropertyLocationKind, RoleDefinition, Service, User } from './models.ts';

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
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

const toProperty = (row: any): Property => ({
  ...row,
  price: Number(row.price || 0),
  bedrooms: row.bedrooms == null ? undefined : Number(row.bedrooms),
  bathrooms: row.bathrooms == null ? undefined : Number(row.bathrooms),
  sqm: row.sqm == null ? undefined : Number(row.sqm),
  area_sqft: row.area_sqft == null ? undefined : Number(row.area_sqft),
  gallery: jsonArray(row.gallery),
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
      'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW() LIMIT 1',
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
    const rows = await query<any[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await query<any[]>('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
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

  async getProperties(): Promise<Property[]> {
    return (await query<any[]>('SELECT * FROM properties ORDER BY created_at DESC')).map(toProperty);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const rows = await query<any[]>('SELECT * FROM properties WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? toProperty(rows[0]) : null;
  }

  async createProperty(data: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const id = `prop-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO properties (id,title,description,property_type,location,price,image,status,address,buy_rent,bedrooms,bathrooms,balcony,sqm,area_sqft,street,furnishing_status,shopping,masjid,payment,gallery)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,data.title,data.description,data.property_type,data.location,data.price,data.image,data.status,data.address || null,data.buy_rent || null,data.bedrooms ?? null,data.bathrooms ?? null,data.balcony || null,data.sqm ?? null,data.area_sqft ?? null,data.street || null,data.furnishing_status || null,data.shopping || null,data.masjid || null,data.payment || null,JSON.stringify(data.gallery || [])],
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

  async getDashboardStats() {
    const rows = await query<any[]>(`SELECT
      (SELECT COUNT(*) FROM properties) totalProperties,
      (SELECT COUNT(*) FROM services) totalServices,
      (SELECT COUNT(*) FROM users) totalUsers,
      (SELECT COUNT(*) FROM properties WHERE status='Active') activeListings`);
    return {...rows[0], totalProperties:Number(rows[0].totalProperties), totalServices:Number(rows[0].totalServices), totalUsers:Number(rows[0].totalUsers), activeListings:Number(rows[0].activeListings), changes:{properties:'0 this month',services:'0 this month',users:'0 this month',activeListings:'0 this week'}};
  }

  async getRecentProperties(limit = 5): Promise<Property[]> {
    return (await query<any[]>('SELECT * FROM properties ORDER BY created_at DESC LIMIT ?', [limit])).map(toProperty);
  }

  async getRecentUsers(limit = 5): Promise<Omit<User, 'password_hash' | 'password_salt'>[]> {
    return (await query<any[]>('SELECT * FROM users ORDER BY created_at DESC LIMIT ?', [limit])).map(toUser).map(({password_hash,password_salt,...user}) => user);
  }

  async getListingsOverviewChart() {
    const rows = await query<any[]>(`SELECT DATE_FORMAT(created_at, '%Y-%m') month_key, COUNT(*) listings,
      SUM(status = 'Sold') sales FROM properties WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY month_key ORDER BY month_key`);
    const counts = new Map(rows.map(row => [row.month_key, {listings:Number(row.listings),sales:Number(row.sales)}]));
    return Array.from({length:6}, (_, index) => {
      const date = new Date(); date.setMonth(date.getMonth() - (5 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      return {month:date.toLocaleString('en-US',{month:'short'}), ...(counts.get(key) || {listings:0,sales:0})};
    });
  }

  async getAgencies(params?: {search?:string;country?:string;city?:string;verified?:string|boolean}): Promise<Agency[]> {
    let agencies = (await query<any[]>('SELECT * FROM agencies ORDER BY created_at DESC')).map(toAgency);
    if (params?.search) { const q=params.search.toLowerCase(); agencies=agencies.filter(a=>[a.name,a.country,a.city,a.contactName,a.email,a.address].some(v=>v.toLowerCase().includes(q))); }
    if (params?.country && params.country !== 'All') agencies=agencies.filter(a=>a.country.toLowerCase()===params.country!.toLowerCase());
    if (params?.city && params.city !== 'All') agencies=agencies.filter(a=>a.city.toLowerCase()===params.city!.toLowerCase());
    if (params?.verified !== undefined && params.verified !== 'All') { const value=typeof params.verified==='boolean'?params.verified:params.verified==='true'; agencies=agencies.filter(a=>a.verified===value); }
    return agencies;
  }

  async getAgencyById(id: string): Promise<Agency | null> {
    const rows=await query<any[]>('SELECT * FROM agencies WHERE id=? LIMIT 1',[id]); return rows[0]?toAgency(rows[0]):null;
  }

  async createAgency(data: Omit<Agency,'id'|'createdAt'>): Promise<Agency> {
    const id=`agency-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query('INSERT INTO agencies (id,name,logo,country,city,contact_name,email,phone,website,address,verified) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[id,data.name,data.logo||'',data.country,data.city,data.contactName,data.email,data.phone,data.website||'',data.address||'',data.verified]);
    return (await this.getAgencyById(id))!;
  }

  async updateAgency(id:string,data:Partial<Agency>):Promise<Agency|null>{
    if(!await this.getAgencyById(id))return null;
    await updateColumns('agencies',id,data,{name:'name',logo:'logo',country:'country',city:'city',contactName:'contact_name',email:'email',phone:'phone',website:'website',address:'address',verified:'verified'});
    return this.getAgencyById(id);
  }

  async deleteAgency(id:string):Promise<boolean>{return (await query<ResultSetHeader>('DELETE FROM agencies WHERE id=?',[id])).affectedRows>0;}

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

export type { User, Property, PropertyLocationCategory, PropertyLocationKind, Service, BlogPost, Agency, RoleDefinition, Inquiry } from './models.ts';
export { verifyPassword } from './security.ts';

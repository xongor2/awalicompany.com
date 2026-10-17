import { User, Property, PropertyLocationCategory, PropertyLocationKind, Service, EducationOpportunity, HealthSpecialty, Quotation, QuickPopup, QuickPopupDisplayPage, QuickPopupStatus, BlogPost, DashboardStats, Agency, Customer, Commission, CommissionService, AgencyPayment, RoleDefinition } from '../types';
import { SAMPLE_AGENCIES } from '../data/sampleAgencies';

const API_BASE = '/api';
type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'createdByName' | 'createdByEmail'>;
type AgencyPayload = Omit<Agency, 'id' | 'createdAt' | 'userId'>;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aw_ali_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } finally {
      localStorage.removeItem('aw_ali_token');
    }
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRecentProperties(): Promise<Property[]> {
    const res = await fetch(`${API_BASE}/dashboard/recent-properties`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRecentUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/dashboard/recent-users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getChartData(): Promise<{ month: string; listings: number; sales: number }[]> {
    const res = await fetch(`${API_BASE}/dashboard/chart`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Properties
  async getProperties(params?: {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    portal?: boolean;
  }): Promise<Property[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type && params.type !== 'All') query.append('type', params.type);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.location && params.location !== 'All') query.append('location', params.location);
    if (params?.minPrice) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.portal) query.append('portal', 'true');

    const res = await fetch(`${API_BASE}/properties?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getProperty(id: string): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteProperty(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPropertyLocationCategories(kind: PropertyLocationKind): Promise<PropertyLocationCategory[]> {
    const path = kind === 'Country' ? 'countries' : 'cities';
    const res = await fetch(`${API_BASE}/property-locations/${path}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createPropertyLocationCategory(
    kind: PropertyLocationKind,
    data: Pick<PropertyLocationCategory, 'name' | 'description'>,
  ): Promise<PropertyLocationCategory> {
    const path = kind === 'Country' ? 'countries' : 'cities';
    const res = await fetch(`${API_BASE}/property-locations/${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updatePropertyLocationCategory(
    kind: PropertyLocationKind,
    id: string,
    data: Pick<PropertyLocationCategory, 'name' | 'description'>,
  ): Promise<PropertyLocationCategory> {
    const path = kind === 'Country' ? 'countries' : 'cities';
    const res = await fetch(`${API_BASE}/property-locations/${path}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deletePropertyLocationCategory(kind: PropertyLocationKind, id: string): Promise<{ message: string }> {
    const path = kind === 'Country' ? 'countries' : 'cities';
    const res = await fetch(`${API_BASE}/property-locations/${path}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Services
  async getServices(params?: { search?: string; category?: string; status?: string }): Promise<Service[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`${API_BASE}/services?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getService(id: string): Promise<Service> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteService(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Education opportunities
  async getEducationOpportunities(search?: string, portal = false): Promise<EducationOpportunity[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (portal) query.append('portal', 'true');
    const res = await fetch(`${API_BASE}/education?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createEducationOpportunity(
    data: Pick<EducationOpportunity, 'title' | 'description' | 'thumbnail' | 'availableDegrees' | 'universityUrl'>,
  ): Promise<EducationOpportunity> {
    const res = await fetch(`${API_BASE}/education`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateEducationOpportunity(
    id: string,
    data: Pick<EducationOpportunity, 'title' | 'description' | 'thumbnail' | 'availableDegrees' | 'universityUrl'>,
  ): Promise<EducationOpportunity> {
    const res = await fetch(`${API_BASE}/education/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteEducationOpportunity(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/education/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Health specialties
  async getHealthSpecialties(search?: string, portal = false): Promise<HealthSpecialty[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (portal) query.append('portal', 'true');
    const res = await fetch(`${API_BASE}/health-specialties?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createHealthSpecialty(
    data: Pick<HealthSpecialty, 'category' | 'name' | 'country' | 'city' | 'description' | 'keyProcedures' | 'destinations' | 'image' | 'status'>,
  ): Promise<HealthSpecialty> {
    const res = await fetch(`${API_BASE}/health-specialties`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateHealthSpecialty(
    id: string,
    data: Pick<HealthSpecialty, 'category' | 'name' | 'country' | 'city' | 'description' | 'keyProcedures' | 'destinations' | 'image' | 'status'>,
  ): Promise<HealthSpecialty> {
    const res = await fetch(`${API_BASE}/health-specialties/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteHealthSpecialty(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/health-specialties/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Quotations
  async getQuotations(params?: { search?: string; status?: string }): Promise<Quotation[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    const res = await fetch(`${API_BASE}/quotations?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createQuotation(
    data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateQuotation(
    id: string,
    data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteQuotation(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Quick Pop Ups
  async getQuickPopups(): Promise<QuickPopup[]> {
    const res = await fetch(`${API_BASE}/popups`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getActiveQuickPopup(displayPage: QuickPopupDisplayPage): Promise<QuickPopup | null> {
    const query = new URLSearchParams({ displayPage });
    const res = await fetch(`${API_BASE}/popups/active?${query.toString()}`);
    return handleResponse(res);
  },

  async createQuickPopup(data: Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickPopup> {
    const res = await fetch(`${API_BASE}/popups`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateQuickPopup(id: string, data: Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuickPopup> {
    const res = await fetch(`${API_BASE}/popups/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateQuickPopupStatus(id: string, status: QuickPopupStatus): Promise<QuickPopup> {
    const res = await fetch(`${API_BASE}/popups/${id}/status`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async duplicateQuickPopup(id: string): Promise<QuickPopup> {
    const res = await fetch(`${API_BASE}/popups/${id}/duplicate`, {
      method: 'POST', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async deleteQuickPopup(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/popups/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Blogs
  async getBlogs(params?: { search?: string; category?: string; status?: string }): Promise<BlogPost[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`${API_BASE}/blogs?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getBlog(id: string): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createBlog(data: {
    title: string;
    content: string;
    thumbnail?: string;
    categories: string[];
    status: 'Published' | 'Draft';
    published_date?: string;
  }): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateBlog(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteBlog(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getBlogCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/blogs/categories/all`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createBlogCategory(name: string): Promise<{ category: string; alreadyExisted: boolean }> {
    const res = await fetch(`${API_BASE}/blogs/categories/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    return handleResponse(res);
  },

  // Users
  async getUsers(params?: { search?: string; role?: string; status?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role && params.role !== 'All') query.append('role', params.role);
    if (params?.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`${API_BASE}/users?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createUser(data: Partial<User> & { password: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Roles and page access
  async getRoles(): Promise<RoleDefinition[]> {
    const res = await fetch(`${API_BASE}/roles`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createRole(data: Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>): Promise<RoleDefinition> {
    const res = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateRole(id: string, data: Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>): Promise<RoleDefinition> {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteRole(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Profile
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updatePassword(data: { currentPassword: string; newPassword: string; confirmPassword?: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/profile/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Agencies
  async getAgencies(params?: { search?: string; country?: string; city?: string; verified?: string | boolean; portal?: boolean }): Promise<Agency[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.country && params.country !== 'All') query.append('country', params.country);
      if (params?.city && params.city !== 'All') query.append('city', params.city);
      if (params?.verified !== undefined && params.verified !== 'All') query.append('verified', String(params.verified));
      if (params?.portal) query.append('portal', 'true');
      const res = await fetch(`${API_BASE}/agencies?${query.toString()}`, params?.portal ? { headers: getAuthHeaders() } : undefined);
      if (res.ok) {
        return await res.json();
      }
      if (params?.portal) return handleResponse(res);
    } catch (error) {
      if (params?.portal) throw error;
      // Fallback to sample data
    }
    let result = [...SAMPLE_AGENCIES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.contactName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q)
      );
    }
    if (params?.country && params.country !== 'All') {
      result = result.filter(a => a.country.toLowerCase() === params.country!.toLowerCase());
    }
    if (params?.city && params.city !== 'All') {
      result = result.filter(a => a.city.toLowerCase() === params.city!.toLowerCase());
    }
    if (params?.verified !== undefined && params?.verified !== 'All') {
      const isVer = typeof params.verified === 'boolean' ? params.verified : params.verified === 'true';
      result = result.filter(a => a.verified === isVer);
    }
    return result;
  },

  async createAgency(data: AgencyPayload): Promise<Agency> {
    const res = await fetch(`${API_BASE}/agencies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAgency(id: string, data: Partial<Agency>): Promise<Agency> {
    const res = await fetch(`${API_BASE}/agencies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAgency(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/agencies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createCustomer(data: CustomerPayload): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCustomer(id: string, data: CustomerPayload): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Commissions
  async getCommissions(params?: { search?: string; service?: string }): Promise<Commission[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.service && params.service !== 'All') query.append('service', params.service);
    const res = await fetch(`${API_BASE}/commissions?${query.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createCommissions(data: {
    userId: string;
    commissions: Array<{ service: CommissionService | 'All Services'; percentage: number }>;
  }): Promise<Commission[]> {
    const res = await fetch(`${API_BASE}/commissions`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCommission(
    id: string,
    data: { service: CommissionService; percentage: number },
  ): Promise<Commission> {
    const res = await fetch(`${API_BASE}/commissions/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCommission(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/commissions/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPayments(): Promise<AgencyPayment[]> {
    const res = await fetch(`${API_BASE}/payments`, { headers: getAuthHeaders() });
    return handleResponse(res);
  }
};

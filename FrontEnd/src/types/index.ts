export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Client';
  status: 'Active' | 'Pending' | 'Inactive';
  profile_image: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  type: 'System' | 'Custom';
  pageAccess: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: 'Residential' | 'Commercial' | 'Apartment' | 'Villa' | 'Plot';
  location: string;
  price: number;
  image: string; // Featured image
  status: 'Active' | 'Pending' | 'Sold';
  // Additional System Specification fields from screenshots
  address?: string;
  buy_rent?: 'Sale' | 'Rent';
  bedrooms?: number;
  bathrooms?: number;
  balcony?: 'Yes' | 'No';
  sqm?: number;
  area_sqft?: number;
  street?: 'Yes' | 'No' | string;
  furnishing_status?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  shopping?: string;
  masjid?: 'Near' | 'Far';
  payment?: string;
  gallery?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  title?: string;
  category: 'Education' | 'Consulting' | 'Import / Export' | 'Real Estate';
  description: string;
  image: string;
  status: 'Active' | 'Pending' | 'Inactive';
  features?: string[];
  created_at: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  thumbnail: string; // Featured image used as thumbnail in blog list
  categories: string[];
  status: 'Published' | 'Draft';
  published_date: string;
  created_at: string;
  updated_at?: string;
  author?: string;
  views?: number;
}

export interface Agency {
  id: string;
  name: string;
  logo?: string;
  country: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  verified: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProperties: number;
  totalServices: number;
  totalUsers: number;
  activeListings: number;
  changes: {
    properties: string;
    services: string;
    users: string;
    activeListings: string;
  };
}

export type Theme = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

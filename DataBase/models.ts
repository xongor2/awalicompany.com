export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: 'Admin' | 'Agent' | 'Agency' | 'Client';
  status: 'Active' | 'Pending' | 'Inactive';
  profile_image: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: 'Residential' | 'Commercial' | 'Apartment' | 'Villa' | 'Plot';
  location: string;
  country?: string;
  city?: string;
  price: number;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
  address?: string;
  buy_rent?: 'Sale' | 'Rent';
  bedrooms?: string;
  bathrooms?: number;
  balcony?: 'Yes' | 'No';
  sqm?: number;
  area_sqft?: number;
  street?: string;
  furnishing_status?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  shopping?: string;
  masjid?: 'Near' | 'Far';
  payment?: string;
  gallery?: string[];
  created_at: string;
  updated_at: string;
}

export type PropertyLocationKind = 'Country' | 'City';

export interface PropertyLocationCategory {
  id: string;
  kind: PropertyLocationKind;
  name: string;
  description: string;
  listingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Education' | 'Consulting' | 'Import / Export' | 'Real Estate';
  description: string;
  image: string;
  status: 'Active' | 'Pending' | 'Inactive';
  features?: string[];
  created_at: string;
  updated_at: string;
}

export type EducationDegree = 'Certificate' | 'Bachelor' | 'Master' | 'PHD';

export interface EducationOpportunity {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  availableDegrees: EducationDegree[];
  universityUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type HealthSpecialtyStatus = 'Active' | 'Inactive';

export interface HealthSpecialty {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  keyProcedures: string[];
  destinations: string[];
  image: string;
  status: HealthSpecialtyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  categories: string[];
  status: 'Published' | 'Draft';
  published_date: string;
  created_at: string;
  updated_at: string;
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

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  type: 'System' | 'Custom';
  pageAccess: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  type: 'Property' | 'Consulting' | 'Health' | 'Education' | 'Agency' | 'General';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  details: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Archived';
  created_at: string;
}

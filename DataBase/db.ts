import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: 'Admin' | 'Agent' | 'Client';
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
  price: number;
  image: string;
  status: 'Active' | 'Pending' | 'Sold';
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
  updated_at: string;
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

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
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

interface DatabaseSchema {
  users: User[];
  properties: Property[];
  services: Service[];
  blogs: BlogPost[];
  categories: string[];
  agencies?: Agency[];
  roles?: RoleDefinition[];
  sessions: Session[];
  protectedUserIds?: string[];
  migrations?: {
    demoDataCleanupOctober2026?: boolean;
  };
}

const DB_FILE = path.join(process.cwd(), 'DataBase', 'awali_database.json');

const PROTECTED_USER_EMAILS = new Set([
  'awalicompany2020@gmail.com',
  'halsan252@gmail.com'
]);

const NATURE_PROFILE_IMAGES = [
  '/images/avatars/nature-tree.png',
  '/images/avatars/nature-orange-flower.png',
  '/images/avatars/nature-ocean.png',
  '/images/avatars/nature-forest.png',
  '/images/avatars/nature-white-flowers.png',
  '/images/avatars/nature-beach.png'
];

const LEGACY_PEOPLE_AVATAR_IDS = [
  'photo-1534528741775-53994a69daeb',
  'photo-1494790108377-be9c29b29330',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1573496359142-b8d87734a5a2',
  'photo-1500648767791-00dcc994a43e',
  'photo-1580489944761-15a19d654956',
  'photo-1535713875002-d1d0cf377fde'
];

// Password security functions
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = hashPassword(password, salt);
  return check.hash === hash;
}

// Initial Seed Data aligned with UI/UX specification figures
function getInitialSeedData(): DatabaseSchema {
  const bootstrapPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(32).toString('hex');
  const bootstrapEmail = (process.env.SEED_ADMIN_EMAIL || 'ahmed.ali@awali.com').toLowerCase();
  const bootstrapName = process.env.SEED_ADMIN_NAME || 'Main Admin';
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword(bootstrapPassword, adminSalt).hash;

  const agentSalt = crypto.randomBytes(16).toString('hex');
  const agentHash = hashPassword(crypto.randomBytes(32).toString('hex'), agentSalt).hash;

  return {
    users: [
      {
        id: 'usr-1',
        name: bootstrapName,
        email: bootstrapEmail,
        password_hash: adminHash,
        password_salt: adminSalt,
        role: 'Admin',
        status: 'Active',
        profile_image: NATURE_PROFILE_IMAGES[0],
        phone: '+92 300 1234567',
        created_at: '2024-03-01T08:00:00Z',
        updated_at: '2024-03-01T08:00:00Z'
      },
      {
        id: 'usr-2',
        name: 'Sarah Khan',
        email: 'sarah.khan@awali.com',
        password_hash: agentHash,
        password_salt: agentSalt,
        role: 'Agent',
        status: 'Active',
        profile_image: NATURE_PROFILE_IMAGES[1],
        phone: '+92 301 9876543',
        created_at: '2024-03-10T10:30:00Z',
        updated_at: '2024-03-10T10:30:00Z'
      },
      {
        id: 'usr-3',
        name: 'Ali Raza',
        email: 'ali.raza@gmail.com',
        password_hash: agentHash,
        password_salt: agentSalt,
        role: 'Client',
        status: 'Active',
        profile_image: NATURE_PROFILE_IMAGES[2],
        phone: '+92 321 4455667',
        created_at: '2024-03-08T14:15:00Z',
        updated_at: '2024-03-08T14:15:00Z'
      },
      {
        id: 'usr-4',
        name: 'Fatima Noor',
        email: 'fatima.noor@awali.com',
        password_hash: agentHash,
        password_salt: agentSalt,
        role: 'Agent',
        status: 'Pending',
        profile_image: NATURE_PROFILE_IMAGES[3],
        phone: '+92 333 7788990',
        created_at: '2024-03-06T11:00:00Z',
        updated_at: '2024-03-06T11:00:00Z'
      },
      {
        id: 'usr-5',
        name: 'Usman Malik',
        email: 'usman.malik@outlook.com',
        password_hash: agentHash,
        password_salt: agentSalt,
        role: 'Client',
        status: 'Active',
        profile_image: NATURE_PROFILE_IMAGES[4],
        phone: '+92 345 1122334',
        created_at: '2024-03-04T09:20:00Z',
        updated_at: '2024-03-04T09:20:00Z'
      },
      {
        id: 'usr-6',
        name: 'Ayesha Siddiqui',
        email: 'ayesha.s@awali.com',
        password_hash: adminHash,
        password_salt: adminSalt,
        role: 'Admin',
        status: 'Active',
        profile_image: NATURE_PROFILE_IMAGES[5],
        phone: '+92 312 9988776',
        created_at: '2024-03-01T15:45:00Z',
        updated_at: '2024-03-01T15:45:00Z'
      }
    ],
    properties: [
      {
        id: 'prop-so-1',
        title: 'Royal Oceanfront Residence',
        description: 'Prestigious 5-bedroom waterfront villa with direct Indian Ocean vistas in Wadajir district. Private security perimeter, solar backup, marble flooring, and extensive landscaped courtyards.',
        property_type: 'Villa',
        location: 'Mogadishu, Somalia',
        price: 380000,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'Airport Marine Boulevard, Wadajir District, Mogadishu',
        buy_rent: 'Sale',
        bedrooms: 5,
        bathrooms: 6,
        balcony: 'Yes',
        sqm: 418,
        area_sqft: 4500,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'Mogadishu Mall (5 min walk)',
        masjid: 'Near',
        payment: 'Cash / 4 Quarters / Flexible Installments',
        gallery: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
        ],
        created_at: '2026-03-12T14:00:00Z',
        updated_at: '2026-03-12T14:00:00Z'
      },
      {
        id: 'prop-so-2',
        title: 'Mogadishu KM4 Commercial Plaza',
        description: 'Modern 6-storey prime office and retail complex located at the KM4 commercial crossroads. Equipped with dedicated high-capacity diesel generators, dual elevators, underground parking, and fiber optic connectivity.',
        property_type: 'Commercial',
        location: 'Mogadishu, Somalia',
        price: 650000,
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'KM4 Intersection, Hodan District, Mogadishu',
        buy_rent: 'Sale',
        sqm: 910,
        area_sqft: 9800,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'Direct KM4 Commercial Shopping Hub',
        masjid: 'Near',
        payment: 'Cash / Corporate Milestone Plan',
        created_at: '2026-03-11T10:00:00Z',
        updated_at: '2026-03-11T10:00:00Z'
      },
      {
        id: 'prop-so-3',
        title: 'Jazeera Beachfront Sunset Villa',
        description: 'Architect-designed 4-bedroom luxury coastal escape near Jazeera Beach. Infinity splash pool, outdoor barbecue terrace, 24/7 guarded gatehouse, and panoramic ocean sunsets.',
        property_type: 'Villa',
        location: 'Mogadishu, Somalia',
        price: 295000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'Jazeera Beach Coastal Road, Mogadishu',
        buy_rent: 'Sale',
        bedrooms: 4,
        bathrooms: 4,
        balcony: 'Yes',
        sqm: 334,
        area_sqft: 3600,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'Mogadishu Mall & Jazeera Resort Commercial Area (6 min)',
        masjid: 'Near',
        payment: 'Cash / 4 Quarters / Flexible Installments',
        created_at: '2026-03-10T12:00:00Z',
        updated_at: '2026-03-10T12:00:00Z'
      },
      {
        id: 'prop-so-4',
        title: 'Ambassador Heights Executive Villa',
        description: 'Spacious luxury compound residence located in prestigious Ibrahim Koodbuur district. Gated security, landscaped fruit garden, water reservoir system, and staff quarters.',
        property_type: 'Villa',
        location: 'Hargeisa, Somalia',
        price: 240000,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'Ibrahim Koodbuur District, Hargeisa',
        buy_rent: 'Sale',
        bedrooms: 4,
        bathrooms: 4,
        balcony: 'Yes',
        sqm: 315,
        area_sqft: 3400,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'Jigjiga Yar Commercial Mall (5 min)',
        masjid: 'Near',
        payment: 'Cash / 4 Quarters / Flexible Installments',
        created_at: '2026-03-09T09:00:00Z',
        updated_at: '2026-03-09T09:00:00Z'
      },
      {
        id: 'prop-tr-1',
        title: 'Bosphorus View Panoramic Penthouse',
        description: 'Unrivaled luxury 4-bedroom duplex overlooking the Bosphorus Strait in Beşiktaş / Bebek. Private rooftop jacuzzi terrace, smart home automation, concierge service, and private yacht berth access.',
        property_type: 'Apartment',
        location: 'Istanbul, Turkey',
        price: 720000,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'Cevdet Paşa Caddesi, Bebek Coastline, Istanbul',
        buy_rent: 'Sale',
        bedrooms: 4,
        bathrooms: 3,
        balcony: 'Yes',
        sqm: 297,
        area_sqft: 3200,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'Zorlu Center & Akmerkez Mall (7 min)',
        masjid: 'Near',
        payment: 'Cash / 4 Quarters / Flexible Installments',
        created_at: '2026-03-12T16:00:00Z',
        updated_at: '2026-03-12T16:00:00Z'
      },
      {
        id: 'prop-tr-4',
        title: 'Mediterranean Villa with Private Pool',
        description: 'Spectacular 5-bedroom luxury estate in Lara Beach district. Private infinity pool, landscaped citrus gardens, sauna, Turkish hammam, and 5-minute walk to private beach clubs.',
        property_type: 'Villa',
        location: 'Antalya, Turkey',
        price: 540000,
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        address: 'Lara Beach Road, Muratpaşa, Antalya',
        buy_rent: 'Sale',
        bedrooms: 5,
        bathrooms: 5,
        balcony: 'Yes',
        sqm: 390,
        area_sqft: 4200,
        street: 'Yes (Paved Road / Main Boulevard)',
        furnishing_status: 'Furnished',
        shopping: 'TerraCity Luxury Mall (5 min)',
        masjid: 'Near',
        payment: 'Cash / 4 Quarters / Flexible Installments',
        created_at: '2026-03-09T14:00:00Z',
        updated_at: '2026-03-09T14:00:00Z'
      },
      {
        id: 'prop-1',
        title: 'Modern Family House',
        description: 'Luxurious 5-bedroom architect-designed family residence located in prime DHA Phase 6. Features double-height ceilings, Italian modular kitchen, lush landscaped garden, and smart home automation.',
        property_type: 'Residential',
        location: 'Lahore, Pakistan',
        price: 25000000,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        bedrooms: 5,
        bathrooms: 6,
        area_sqft: 4500,
        created_at: '2024-03-10T14:30:00Z',
        updated_at: '2024-03-10T14:30:00Z'
      },
      {
        id: 'prop-2',
        title: 'Luxury Apartment',
        description: 'Stunning sea-facing duplex penthouse with panoramic ocean views, private infinity splash pool, 24/7 dedicated concierge service, and state-of-the-art health club access in Clifton.',
        property_type: 'Apartment',
        location: 'Karachi, Pakistan',
        price: 18500000,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        status: 'Pending',
        bedrooms: 3,
        bathrooms: 4,
        area_sqft: 3200,
        created_at: '2024-03-08T11:20:00Z',
        updated_at: '2024-03-08T11:20:00Z'
      },
      {
        id: 'prop-3',
        title: 'Commercial Plaza',
        description: 'Prime 4-story corporate office building in Blue Area. Grade-A finish, 3-level underground executive parking, backup solar-hybrid generators, and high-speed fiber backbone.',
        property_type: 'Commercial',
        location: 'Islamabad, Pakistan',
        price: 45000000,
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        area_sqft: 12000,
        created_at: '2024-03-05T09:00:00Z',
        updated_at: '2024-03-05T09:00:00Z'
      },
      {
        id: 'prop-4',
        title: 'Cozy Villa',
        description: 'Charming Mediterranean-styled single-storey villa in gated executive community. Includes private courtyard, solar energy setup, and covered 2-car garage.',
        property_type: 'Villa',
        location: 'Faisalabad, Pakistan',
        price: 32000000,
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
        status: 'Sold',
        bedrooms: 4,
        bathrooms: 4,
        area_sqft: 3800,
        created_at: '2024-03-02T16:40:00Z',
        updated_at: '2024-03-02T16:40:00Z'
      },
      {
        id: 'prop-5',
        title: 'Residential Plot',
        description: 'Corner 1-Kanal ready-for-construction plot situated on main boulevard. Clear title, LDA approved, immediate possession and utilities connected.',
        property_type: 'Plot',
        location: 'Multan, Pakistan',
        price: 8500000,
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        area_sqft: 4500,
        created_at: '2024-02-28T13:10:00Z',
        updated_at: '2024-02-28T13:10:00Z'
      },
      {
        id: 'prop-6',
        title: 'Executive Corporate Tower Floor',
        description: 'Entire 8th floor commercial space ready for turnkey IT/BPO fitout. High efficiency HVAC, reception lobby, and dedicated high-speed elevators.',
        property_type: 'Commercial',
        location: 'Lahore, Pakistan',
        price: 38000000,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        area_sqft: 8500,
        created_at: '2024-02-25T10:00:00Z',
        updated_at: '2024-02-25T10:00:00Z'
      },
      {
        id: 'prop-7',
        title: 'Contemporary Lakeview Apartment',
        description: 'Modern 2-bedroom luxury flat overlooking Rawal Lake. Furnished with designer imported fittings, private balcony, and smart security card access.',
        property_type: 'Apartment',
        location: 'Islamabad, Pakistan',
        price: 14200000,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 1800,
        created_at: '2024-02-20T12:00:00Z',
        updated_at: '2024-02-20T12:00:00Z'
      }
    ],
    services: [
      {
        id: 'srv-1',
        name: 'International Student University Placement',
        category: 'Education',
        description: 'Comprehensive foreign educational counseling, university admissions advisory, scholarship applications, and visa documentation guidance for top UK, US, Turkish, and European universities.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Admissions Processing', 'Visa Guidance', 'Scholarship Assistance', 'Pre Departure Briefings'],
        created_at: '2024-02-15T09:00:00Z',
        updated_at: '2024-02-15T09:00:00Z'
      },
      {
        id: 'srv-edu-2',
        name: 'Global Scholarship & Financial Grant Advisory',
        category: 'Education',
        description: 'Expert guidance for securing government, institutional, and merit-based university scholarships, fee waivers, and academic research grants in Turkey, Europe, and Asia.',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Scholarship Eligibility Assessment', 'Statement of Purpose (SOP) Polishing', 'Merit Grant Applications', 'Funding Strategy'],
        created_at: '2024-02-16T10:00:00Z',
        updated_at: '2024-02-16T10:00:00Z'
      },
      {
        id: 'srv-edu-3',
        name: 'Student Visa Processing & Embassy Interview Preparation',
        category: 'Education',
        description: 'Meticulous student visa file preparation, financial document vetting, embassy appointment scheduling, and personalized mock interview coaching.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Document Legalization', 'Financial Proof Vetting', 'Embassy Mock Interviews', 'Visa Protocol Briefings'],
        created_at: '2024-02-17T11:00:00Z',
        updated_at: '2024-02-17T11:00:00Z'
      },
      {
        id: 'srv-edu-4',
        name: 'Medical & Healthcare Degree Placement Abroad',
        category: 'Education',
        description: 'Direct admissions placement for Medicine (MBBS/MD), Dentistry, Pharmacy, and Nursing in recognized and accredited universities across Turkey, Egypt, and Europe.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['JCI Accredited Teaching Hospitals', 'WHO/FAIMER Recognized', 'Clinical Rotations Support', 'Equivalency Guidance'],
        created_at: '2024-02-17T14:00:00Z',
        updated_at: '2024-02-17T14:00:00Z'
      },
      {
        id: 'srv-edu-5',
        name: 'STEM, Engineering & Computer Science Admissions',
        category: 'Education',
        description: 'Specialized application support for Software Engineering, Artificial Intelligence, Cybersecurity, Civil, Electrical, and Mechanical Engineering degrees.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Tech Curriculum Evaluation', 'Industry Internship Pipelines', 'Lab & Research Facilities', 'Accredited STEM Programs'],
        created_at: '2024-02-18T09:30:00Z',
        updated_at: '2024-02-18T09:30:00Z'
      },
      {
        id: 'srv-edu-6',
        name: 'Pre Departure Briefing & Student Accommodation Placement',
        category: 'Education',
        description: 'Complete student relocation assistance including campus dormitory booking, airport reception, local SIM/banking guidance, and student residence permit handling.',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Dormitory & Housing Booking', 'Airport Welcome Protocol', 'Residence Permit Support', 'Emergency Family Liaison'],
        created_at: '2024-02-18T10:30:00Z',
        updated_at: '2024-02-18T10:30:00Z'
      },
      {
        id: 'srv-2',
        name: 'Strategic Business & Corporate Advisory',
        category: 'Consulting',
        description: 'Tailored strategic management consulting for corporate expansion, regulatory compliance, risk mitigation, and market feasibility studies across emerging markets.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Market Entry Strategy', 'Corporate Restructuring', 'Financial Modeling', 'Operational Audit'],
        created_at: '2024-02-18T11:00:00Z',
        updated_at: '2024-02-18T11:00:00Z'
      },
      {
        id: 'srv-2b',
        name: 'Market Feasibility & Investment Appraisal',
        category: 'Consulting',
        description: 'Independent commercial feasibility studies, investment ROI modeling, market entry roadmaps, and demographic market analysis for high-growth ventures.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Feasibility Analysis', 'Financial Viability Models', 'Risk Assessment', 'Market Penetration Blueprint'],
        created_at: '2024-02-20T10:00:00Z',
        updated_at: '2024-02-20T10:00:00Z'
      },
      {
        id: 'srv-2c',
        name: 'Legal, Regulatory & Trade Compliance Advisory',
        category: 'Consulting',
        description: 'Navigating municipal licensing, foreign investment compliance, corporate governance, contract vetting, and bilateral trade regulatory frameworks.',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Corporate Governance', 'Regulatory Filings', 'Contract Review', 'Compliance Auditing'],
        created_at: '2024-02-21T12:00:00Z',
        updated_at: '2024-02-21T12:00:00Z'
      },
      {
        id: 'srv-2d',
        name: 'Organizational Leadership & Institutional Capacity',
        category: 'Consulting',
        description: 'Comprehensive organizational restructuring, human resource governance, executive capability workshops, and standard operating procedures (SOPs).',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Executive Coaching', 'HR Governance', 'SOP Development', 'Capability Benchmarking'],
        created_at: '2024-02-22T08:00:00Z',
        updated_at: '2024-02-22T08:00:00Z'
      },
      {
        id: 'srv-3',
        name: 'Cross Border Freight & Global Trade Operations',
        category: 'Import / Export',
        description: 'Complete import and export logistics, customs clearance, freight forwarding, tariff optimization, and cross border supply chain coordination worldwide.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Customs Clearance', 'Air & Ocean Freight', 'Warehousing Logistics', 'Tariff & Trade Compliance'],
        created_at: '2024-02-22T14:30:00Z',
        updated_at: '2024-02-22T14:30:00Z'
      },
      {
        id: 'srv-4',
        name: 'Commercial & High Value Real Estate Advisory',
        category: 'Real Estate',
        description: 'Turnkey property portfolio management, asset valuation, high yield commercial leasing, land acquisitions, and institutional developer advisory.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
        status: 'Active',
        features: ['Institutional Asset Management', 'Title Due Diligence', 'High Yield Investment Sourcing', 'Turnkey Facility Management'],
        created_at: '2024-02-26T10:00:00Z',
        updated_at: '2024-02-26T10:00:00Z'
      }
    ],
    blogs: [
      {
        id: 'blog-1',
        title: 'Top Emerging Real Estate Investment Hotspots in 2026',
        content: '<h2>Navigating High Yield Property Markets</h2><p>As commercial development accelerates across primary metropolitan belts, discerning investors are focusing on strategic locations offering both sustainable rental yield and capital appreciation.</p><p>Key indicators include infrastructural connectivity, modern municipal master-planning, and high-efficiency utilities integration.</p><blockquote>"Strategic timing and institutional due diligence distinguish premier real estate portfolios from speculative investments."</blockquote><p>Discover how AW Ali Company guides institutional and private clients toward proven land acquisitions.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
        categories: ['Real Estate', 'Investment'],
        status: 'Published',
        published_date: '2026-09-18T10:00:00Z',
        author: 'AW Ali Editorial',
        created_at: '2026-09-18T10:00:00Z',
        updated_at: '2026-09-18T10:00:00Z',
        views: 1420
      },
      {
        id: 'blog-2',
        title: 'Strategic Business Expansion: Navigating Cross-Border Trade & Logistics',
        content: '<h2>Optimizing Global Supply Chains for Emerging Markets</h2><p>International commerce requires meticulous compliance with regulatory customs frameworks, freight consolidation, and tariff scheduling.</p><p>By leveraging integrated logistics solutions, enterprises minimize border transit delays and protect inventory value.</p><ul><li>Harmonized tariff classification</li><li>Expedited customs clearance protocols</li><li>Multi-modal maritime and air freight corridors</li></ul>',
        thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
        categories: ['Business', 'Investment'],
        status: 'Published',
        published_date: '2026-09-15T14:30:00Z',
        author: 'AW Ali Editorial',
        created_at: '2026-09-15T14:30:00Z',
        updated_at: '2026-09-15T14:30:00Z',
        views: 980
      },
      {
        id: 'blog-3',
        title: 'Global Higher Education Advisory: Essential Guidelines for International Students',
        content: '<h2>Selecting Accredited Universities Worldwide</h2><p>Studying abroad is an transformative career milestone. Our educational consulting specialists evaluate academic credentials, visa requirements, and scholarship eligibility across leading institutions in the UK, Europe, and North America.</p><p>Structured document preparation and interview coaching ensure seamless admissions.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
        categories: ['Education', 'Lifestyle'],
        status: 'Published',
        published_date: '2026-09-10T09:15:00Z',
        author: 'Sarah Khan',
        created_at: '2026-09-10T09:15:00Z',
        updated_at: '2026-09-10T09:15:00Z',
        views: 2150
      },
      {
        id: 'blog-4',
        title: 'Commercial Property Valuation & Portfolio Risk Mitigation',
        content: '<h2>Advanced Financial Modeling for Corporate Real Estate</h2><p>Draft analysis examining corporate leases, debt-service coverage ratios, and tenant default hedges under fluctuating interest regimes.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
        categories: ['Real Estate', 'Business'],
        status: 'Draft',
        published_date: '',
        author: 'Ahmed Ali',
        created_at: '2026-09-19T11:00:00Z',
        updated_at: '2026-09-19T11:00:00Z',
        views: 0
      },
      {
        id: 'blog-5',
        title: 'Modern Urban Living: Villa Communities vs Luxury Penthouses',
        content: '<h2>Balancing Privacy, Amenities, and Central City Access</h2><p>An in-depth lifestyle comparison evaluating the architectural ergonomics, security protocols, and community management between gated suburban villas and skyline duplex penthouses.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
        categories: ['Real Estate', 'Lifestyle'],
        status: 'Draft',
        published_date: '',
        author: 'Sarah Khan',
        created_at: '2026-09-17T16:20:00Z',
        updated_at: '2026-09-17T16:20:00Z',
        views: 0
      }
    ],
    categories: ['Real Estate', 'Investment', 'Business', 'Education', 'Lifestyle'],
    agencies: [
      {
        id: 'agency-1',
        name: 'Solas Maritime & Logistics Agency',
        logo: '',
        country: 'United Arab Emirates',
        city: 'Dubai',
        contactName: 'Zayd Al-Nuaimi',
        email: 'contact@solasmaritime-agency.ae',
        phone: '+971 4 883 2910',
        website: 'https://example.com/solas-maritime',
        address: 'Suite 408, Al Mina Towers, Port Rashid Road',
        verified: true,
        createdAt: '2024-05-14T09:00:00Z'
      },
      {
        id: 'agency-2',
        name: 'Apex Point Consulting & Property Agency',
        logo: '',
        country: 'Turkey',
        city: 'Istanbul',
        contactName: 'Elif Demir',
        email: 'advisory@apexpoint-agency.tr',
        phone: '+90 212 458 9200',
        website: 'https://example.com/apex-point',
        address: 'Büyükdere Caddesi No: 182, Levent',
        verified: true,
        createdAt: '2024-09-20T11:30:00Z'
      },
      {
        id: 'agency-3',
        name: 'Horn Horizon Trade & Procurement Agency',
        logo: '',
        country: 'Somalia',
        city: 'Mogadishu',
        contactName: 'Abdirahman Warsame',
        email: 'inquiries@hornhorizon-agency.so',
        phone: '+252 61 789 4432',
        website: 'https://example.com/horn-horizon',
        address: 'Level 3, KM4 Commercial Center, Hodan',
        verified: true,
        createdAt: '2025-01-15T08:15:00Z'
      },
      {
        id: 'agency-4',
        name: 'Nile Valley Educational Admissions Agency',
        logo: '',
        country: 'Egypt',
        city: 'Cairo',
        contactName: 'Mona Hassan',
        email: 'admissions@nilevalley-agency.eg',
        phone: '+20 2 2456 7810',
        website: 'https://example.com/nile-valley',
        address: 'El Nozha Street, Heliopolis',
        verified: true,
        createdAt: '2025-06-10T14:00:00Z'
      },
      {
        id: 'agency-5',
        name: 'Khatib & Partners Commercial Realty',
        logo: '',
        country: 'Qatar',
        city: 'Doha',
        contactName: 'Tariq Al-Mansoor',
        email: 'partner@khatib-realty.qa',
        phone: '+974 4498 7120',
        website: 'https://example.com/khatib-partners',
        address: 'Marina Twin Towers, Lusail City',
        verified: false,
        createdAt: '2025-11-05T10:45:00Z'
      },
      {
        id: 'agency-6',
        name: 'Meridian Global Healthcare Placement Agency',
        logo: '',
        country: 'Malaysia',
        city: 'Kuala Lumpur',
        contactName: 'Dr. Farhan Azman',
        email: 'liaison@meridianhealth-agency.my',
        phone: '+60 3 2188 5630',
        website: 'https://example.com/meridian-health',
        address: 'Jalan Ampang, KLCC Financial District',
        verified: true,
        createdAt: '2026-03-12T16:20:00Z'
      }
    ],
    roles: [
      {
        id: 'role-admin',
        name: 'Admin',
        description: 'Full access to every management page and configuration area.',
        type: 'System',
        pageAccess: ['dashboard', 'properties', 'services', 'agencies', 'blogs', 'users', 'roles', 'profile'],
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-01T08:00:00Z'
      },
      {
        id: 'role-agent',
        name: 'Agent',
        description: 'Operational access for property, service, agency, and content work.',
        type: 'System',
        pageAccess: ['dashboard', 'properties', 'services', 'agencies', 'blogs', 'profile'],
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-01T08:00:00Z'
      },
      {
        id: 'role-client',
        name: 'Client',
        description: 'Limited portal access for authorized clients.',
        type: 'System',
        pageAccess: ['dashboard', 'properties', 'services', 'profile'],
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-01T08:00:00Z'
      }
    ],
    sessions: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure new schema keys exist
        if (!Array.isArray(this.data.blogs)) {
          this.data.blogs = getInitialSeedData().blogs;
        }
        if (!Array.isArray(this.data.categories)) {
          this.data.categories = ['Real Estate', 'Investment', 'Business', 'Education', 'Lifestyle'];
        }
        if (!Array.isArray(this.data.agencies) || this.data.agencies.length === 0) {
          this.data.agencies = getInitialSeedData().agencies;
          this.save();
        }
        if (!Array.isArray(this.data.roles) || this.data.roles.length === 0) {
          this.data.roles = getInitialSeedData().roles;
          this.save();
        }
      } catch (err) {
        console.error('Error reading database file, re-initializing with seed data:', err);
        this.data = getInitialSeedData();
        this.save();
      }
    } else {
      this.data = getInitialSeedData();
      this.save();
    }

    this.ensureConfiguredAdmin();
    this.ensureProtectedUsers();
    this.runDemoDataCleanup();
    this.ensureNatureProfileImages();
  }

  private isProtectedUser(user: User): boolean {
    return PROTECTED_USER_EMAILS.has(user.email.trim().toLowerCase())
      || (this.data.protectedUserIds || []).includes(user.id);
  }

  private ensureProtectedUsers(): void {
    const protectedIds = new Set(this.data.protectedUserIds || []);
    const initialSize = protectedIds.size;

    this.data.users.forEach(user => {
      if (PROTECTED_USER_EMAILS.has(user.email.trim().toLowerCase())) {
        protectedIds.add(user.id);
      }
    });

    this.data.protectedUserIds = Array.from(protectedIds);
    if (protectedIds.size !== initialSize) this.save();
  }

  /**
   * Removes the original demonstration records exactly once. The migration
   * flag prevents any property, service, or user created later from being
   * removed by a future server restart or deployment.
   */
  private runDemoDataCleanup(): void {
    this.data.migrations ||= {};
    if (this.data.migrations.demoDataCleanupOctober2026) return;

    this.data.users = this.data.users.filter(user => this.isProtectedUser(user));
    const retainedUserIds = new Set(this.data.users.map(user => user.id));
    this.data.sessions = this.data.sessions.filter(session => retainedUserIds.has(session.userId));
    this.data.properties = [];
    this.data.services = [];
    this.data.migrations.demoDataCleanupOctober2026 = true;
    this.save();
  }

  private ensureNatureProfileImages(): void {
    let changed = false;
    this.data.users.forEach((user, index) => {
      const isLegacyPeopleAvatar = LEGACY_PEOPLE_AVATAR_IDS.some(id => user.profile_image?.includes(id));
      if (!user.profile_image || isLegacyPeopleAvatar) {
        user.profile_image = NATURE_PROFILE_IMAGES[index % NATURE_PROFILE_IMAGES.length];
        user.updated_at = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) this.save();
  }

  /**
   * Creates the configured production administrator once without committing
   * credentials to source control. Existing accounts keep their password so
   * changing it in the profile is not undone by a later restart.
   */
  private ensureConfiguredAdmin(): void {
    const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) return;

    const existing = this.data.users.find(user => user.email.toLowerCase() === email);
    if (existing) {
      let changed = false;
      if (existing.role !== 'Admin') {
        existing.role = 'Admin';
        changed = true;
      }
      if (existing.status !== 'Active') {
        existing.status = 'Active';
        changed = true;
      }
      if (changed) {
        existing.updated_at = new Date().toISOString();
        this.save();
      }
      return;
    }

    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();
    this.data.users.push({
      id: `usr-admin-${Date.now()}`,
      name: process.env.SEED_ADMIN_NAME?.trim() || 'Main Admin',
      email,
      password_hash: hash,
      password_salt: salt,
      role: 'Admin',
      status: 'Active',
      profile_image: NATURE_PROFILE_IMAGES[0],
      phone: '',
      created_at: now,
      updated_at: now
    });
    this.save();
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- SESSIONS & AUTH ---
  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.data.sessions.push({ token, userId, expiresAt });
    this.save();
    return token;
  }

  public getSessionUser(token: string): User | null {
    const session = this.data.sessions.find(s => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;
    return this.getUserById(session.userId);
  }

  public deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // --- USERS ---
  public getUsers(filter?: { search?: string; role?: string; status?: string }): User[] {
    let result = [...this.data.users];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filter?.role && filter.role !== 'All') {
      result = result.filter(u => u.role === filter.role);
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(u => u.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getUserById(id: string): User | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  public getUserByEmail(email: string): User | null {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'Admin' | 'Agent' | 'Client';
    status?: 'Active' | 'Pending' | 'Inactive';
    profile_image?: string;
    phone?: string;
  }): User {
    const { hash, salt } = hashPassword(userData.password);
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password_hash: hash,
      password_salt: salt,
      role: userData.role || 'Client',
      status: userData.status || 'Active',
      profile_image: userData.profile_image || NATURE_PROFILE_IMAGES[0],
      phone: userData.phone || '',
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role' | 'status' | 'profile_image' | 'phone'>>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.users[index];
  }

  public updateUserPassword(id: string, newPassword: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    const { hash, salt } = hashPassword(newPassword);
    this.data.users[index].password_hash = hash;
    this.data.users[index].password_salt = salt;
    this.data.users[index].updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteUser(id: string): boolean {
    const user = this.data.users.find(candidate => candidate.id === id);
    if (!user) return false;
    if (this.isProtectedUser(user)) {
      throw new Error('This primary administrator account is protected and cannot be deleted.');
    }

    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.sessions = this.data.sessions.filter(s => s.userId !== id);
    if (this.data.users.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- PROPERTIES ---
  public getProperties(filter?: {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Property[] {
    let result = [...this.data.properties];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.property_type.toLowerCase().includes(q)
      );
    }
    if (filter?.type && filter.type !== 'All') {
      result = result.filter(p => p.property_type === filter.type);
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(p => p.status === filter.status);
    }
    if (filter?.location && filter.location !== 'All') {
      result = result.filter(p => p.location.toLowerCase().includes(filter.location!.toLowerCase()));
    }
    if (filter?.minPrice !== undefined && !isNaN(filter.minPrice)) {
      result = result.filter(p => p.price >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
      result = result.filter(p => p.price <= filter.maxPrice!);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getPropertyById(id: string): Property | null {
    return this.data.properties.find(p => p.id === id) || null;
  }

  public createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Property {
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: now,
      updated_at: now
    };
    this.data.properties.push(newProperty);
    this.save();
    return newProperty;
  }

  public updateProperty(id: string, updates: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>): Property | null {
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.properties[index] = {
      ...this.data.properties[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.properties[index];
  }

  public deleteProperty(id: string): boolean {
    const initialLength = this.data.properties.length;
    this.data.properties = this.data.properties.filter(p => p.id !== id);
    if (this.data.properties.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- SERVICES ---
  public getServices(filter?: { search?: string; category?: string; status?: string }): Service[] {
    let result = [...this.data.services];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    if (filter?.category && filter.category !== 'All') {
      result = result.filter(s => s.category === filter.category);
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(s => s.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getServiceById(id: string): Service | null {
    return this.data.services.find(s => s.id === id) || null;
  }

  public createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Service {
    const now = new Date().toISOString();
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: now,
      updated_at: now
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  public updateService(id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Service | null {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.services[index] = {
      ...this.data.services[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.services[index];
  }

  public deleteService(id: string): boolean {
    const initialLength = this.data.services.length;
    this.data.services = this.data.services.filter(s => s.id !== id);
    if (this.data.services.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- BLOGS ---
  public getBlogs(filter?: { search?: string; category?: string; status?: string }): BlogPost[] {
    if (!Array.isArray(this.data.blogs)) {
      this.data.blogs = [];
    }
    let result = [...this.data.blogs];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.content && b.content.toLowerCase().includes(q))
      );
    }
    if (filter?.category && filter.category !== 'All') {
      result = result.filter(b => Array.isArray(b.categories) && b.categories.includes(filter.category!));
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter(b => b.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getBlogById(id: string): BlogPost | null {
    if (!Array.isArray(this.data.blogs)) return null;
    return this.data.blogs.find(b => b.id === id) || null;
  }

  public createBlog(blogData: {
    title: string;
    content: string;
    thumbnail?: string;
    categories?: string[];
    status?: 'Published' | 'Draft';
    author?: string;
    published_date?: string;
  }): BlogPost {
    if (!Array.isArray(this.data.blogs)) {
      this.data.blogs = [];
    }
    const now = new Date().toISOString();
    const isPublished = blogData.status === 'Published';
    const newBlog: BlogPost = {
      id: `blog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: blogData.title,
      content: blogData.content || '',
      thumbnail: blogData.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      categories: Array.isArray(blogData.categories) && blogData.categories.length > 0 ? blogData.categories : ['General'],
      status: blogData.status || 'Draft',
      published_date: isPublished ? (blogData.published_date || now) : (blogData.published_date || ''),
      author: blogData.author || 'AW Ali Editorial',
      created_at: now,
      updated_at: now,
      views: 0
    };
    this.data.blogs.unshift(newBlog);
    this.save();
    return newBlog;
  }

  public updateBlog(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at'>>): BlogPost | null {
    if (!Array.isArray(this.data.blogs)) return null;
    const index = this.data.blogs.findIndex(b => b.id === id);
    if (index === -1) return null;

    const current = this.data.blogs[index];
    const newStatus = updates.status !== undefined ? updates.status : current.status;
    let publishedDate = updates.published_date !== undefined ? updates.published_date : current.published_date;
    if (newStatus === 'Published' && !publishedDate) {
      publishedDate = new Date().toISOString();
    }

    this.data.blogs[index] = {
      ...current,
      ...updates,
      status: newStatus,
      published_date: publishedDate,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.blogs[index];
  }

  public deleteBlog(id: string): boolean {
    if (!Array.isArray(this.data.blogs)) return false;
    const initialLength = this.data.blogs.length;
    this.data.blogs = this.data.blogs.filter(b => b.id !== id);
    if (this.data.blogs.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- BLOG CATEGORIES ---
  public getCategories(): string[] {
    if (!Array.isArray(this.data.categories) || this.data.categories.length === 0) {
      this.data.categories = ['Real Estate', 'Investment', 'Business', 'Education', 'Lifestyle'];
      this.save();
    }
    return this.data.categories;
  }

  public addCategory(name: string): { category: string; alreadyExisted: boolean } {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Category name cannot be empty');
    }
    if (!Array.isArray(this.data.categories)) {
      this.data.categories = ['Real Estate', 'Investment', 'Business', 'Education', 'Lifestyle'];
    }
    const exists = this.data.categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = this.data.categories.find(c => c.toLowerCase() === trimmed.toLowerCase())!;
      return { category: match, alreadyExisted: true };
    }
    this.data.categories.push(trimmed);
    this.save();
    return { category: trimmed, alreadyExisted: false };
  }

  // --- DASHBOARD AGGREGATIONS ---
  public getDashboardStats() {
    const totalProperties = this.data.properties.length;
    const totalServices = this.data.services.length;
    const totalUsers = this.data.users.length;
    const activeListings = this.data.properties.filter(p => p.status === 'Active').length;

    return {
      totalProperties,
      totalServices,
      totalUsers,
      activeListings,
      changes: {
        properties: '+12 this month',
        services: '+3 this month',
        users: '+8 this month',
        activeListings: '+5 this week'
      }
    };
  }

  public getRecentProperties(limit = 5): Property[] {
    return [...this.data.properties]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  public getRecentUsers(limit = 5): Omit<User, 'password_hash' | 'password_salt'>[] {
    return [...this.data.users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(({ password_hash, password_salt, ...user }) => user);
  }

  public getListingsOverviewChart() {
    // Aligned with Figure 1 & Figure 2 in design specification
    return [
      { month: 'Jan', listings: 12, sales: 5 },
      { month: 'Feb', listings: 18, sales: 8 },
      { month: 'Mar', listings: 24, sales: 14 },
      { month: 'Apr', listings: 28, sales: 17 },
      { month: 'May', listings: 35, sales: 22 },
      { month: 'Jun', listings: 40, sales: 29 }
    ];
  }

  // --- AGENCIES ---
  public getAgencies(params?: { search?: string; country?: string; city?: string; verified?: string | boolean }): Agency[] {
    if (!Array.isArray(this.data.agencies)) {
      this.data.agencies = getInitialSeedData().agencies || [];
      this.save();
    }
    let agencies = [...this.data.agencies];

    if (params?.search) {
      const q = params.search.toLowerCase();
      agencies = agencies.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.contactName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q)
      );
    }

    if (params?.country && params.country !== 'All') {
      agencies = agencies.filter(a => a.country.toLowerCase() === params.country!.toLowerCase());
    }

    if (params?.city && params.city !== 'All') {
      agencies = agencies.filter(a => a.city.toLowerCase() === params.city!.toLowerCase());
    }

    if (params?.verified !== undefined && params?.verified !== 'All') {
      const isVerified = typeof params.verified === 'boolean' ? params.verified : params.verified === 'true';
      agencies = agencies.filter(a => a.verified === isVerified);
    }

    return agencies;
  }

  public getAgencyById(id: string): Agency | undefined {
    if (!Array.isArray(this.data.agencies)) return undefined;
    return this.data.agencies.find(a => a.id === id);
  }

  public createAgency(data: Omit<Agency, 'id' | 'createdAt'>): Agency {
    if (!Array.isArray(this.data.agencies)) this.data.agencies = [];
    const newAgency: Agency = {
      ...data,
      id: `agency-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.agencies.unshift(newAgency);
    this.save();
    return newAgency;
  }

  public updateAgency(id: string, data: Partial<Agency>): Agency | null {
    if (!Array.isArray(this.data.agencies)) return null;
    const index = this.data.agencies.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.agencies[index] = {
      ...this.data.agencies[index],
      ...data,
      id: this.data.agencies[index].id,
      createdAt: this.data.agencies[index].createdAt
    };
    this.save();
    return this.data.agencies[index];
  }

  public deleteAgency(id: string): boolean {
    if (!Array.isArray(this.data.agencies)) return false;
    const initialLength = this.data.agencies.length;
    this.data.agencies = this.data.agencies.filter(a => a.id !== id);
    if (this.data.agencies.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ROLE TYPES & PAGE ACCESS ---
  public getRoles(): RoleDefinition[] {
    if (!Array.isArray(this.data.roles)) {
      this.data.roles = getInitialSeedData().roles || [];
      this.save();
    }
    return [...this.data.roles];
  }

  public createRole(data: Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>): RoleDefinition {
    const name = data.name?.trim();
    if (!name) throw new Error('Role name is required.');
    if (this.getRoles().some(role => role.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A role with this name already exists.');
    }

    const now = new Date().toISOString();
    const role: RoleDefinition = {
      id: `role-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description: data.description?.trim() || '',
      type: 'Custom',
      pageAccess: Array.from(new Set(data.pageAccess || [])),
      createdAt: now,
      updatedAt: now
    };
    this.data.roles!.push(role);
    this.save();
    return role;
  }

  public updateRole(id: string, data: Partial<Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>>): RoleDefinition | null {
    const roles = this.getRoles();
    const index = roles.findIndex(role => role.id === id);
    if (index === -1) return null;
    // System role names are identity keys used by existing user accounts and
    // authorization checks. Main Admin may edit their descriptions and page
    // access rules, while the canonical name remains stable.
    const nextName = roles[index].type === 'System'
      ? roles[index].name
      : data.name?.trim() || roles[index].name;
    if (roles.some(role => role.id !== id && role.name.toLowerCase() === nextName.toLowerCase())) {
      throw new Error('A role with this name already exists.');
    }

    const updated: RoleDefinition = {
      ...roles[index],
      ...data,
      name: nextName,
      description: data.description?.trim() ?? roles[index].description,
      pageAccess: data.pageAccess ? Array.from(new Set(data.pageAccess)) : roles[index].pageAccess,
      updatedAt: new Date().toISOString()
    };
    this.data.roles![index] = updated;
    this.save();
    return updated;
  }

  public deleteRole(id: string): boolean {
    const role = this.getRoles().find(item => item.id === id);
    if (!role) return false;
    if (role.type === 'System') throw new Error('System roles cannot be deleted.');
    this.data.roles = this.data.roles!.filter(item => item.id !== id);
    this.save();
    return true;
  }
}

export const db = new Database();

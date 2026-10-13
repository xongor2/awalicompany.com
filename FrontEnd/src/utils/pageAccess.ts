import type { NavSection } from '../components/layout/Sidebar';

const SECTION_PERMISSION: Partial<Record<NavSection, string>> = {
  'property-form': 'properties',
  countries: 'properties',
  cities: 'properties',
};

const PAGE_ORDER: NavSection[] = [
  'dashboard',
  'health',
  'education',
  'properties',
  'services',
  'quotations',
  'agencies',
  'customers',
  'commissions',
  'invoices',
  'settings',
  'blogs',
  'quick-popup',
  'users',
  'roles',
  'profile',
];

export const canAccessSection = (pageAccess: readonly string[], section: NavSection): boolean =>
  pageAccess.includes(SECTION_PERMISSION[section] ?? section);

export const firstAccessibleSection = (pageAccess: readonly string[]): NavSection =>
  PAGE_ORDER.find(section => canAccessSection(pageAccess, section)) ?? 'dashboard';

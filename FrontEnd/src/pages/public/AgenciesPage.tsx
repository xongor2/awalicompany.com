import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  X,
  Plus,
  Building2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Agency } from '../../types';
import { AgencyCard } from '../../components/agencies/AgencyCard';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export interface AgenciesPageProps {
  onNavigateHome: () => void;
  onNavigate?: (page: any) => void;
  onOpenPortal?: () => void;
}

export const AgenciesPage: React.FC<AgenciesPageProps> = ({ onNavigateHome, onNavigate, onOpenPortal }) => {
  const { showToast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [verifiedFilter, setVerifiedFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');

  // Selected agency modal state
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Register / Add Agency modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    verified: true,
    logo: '',
  });

  // Fetch agencies on component mount
  useEffect(() => {
    let isMounted = true;
    const loadAgencies = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAgencies();
        if (isMounted) {
          setAgencies(data);
        }
      } catch (err: any) {
        if (isMounted) {
          showToast('Failed to load agencies directory. Using offline data.', 'error', 'Error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAgencies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique locations for filter dropdown
  const locationOptions = useMemo(() => {
    const locations = new Set<string>();
    agencies.forEach((a) => {
      if (a.country && a.city) {
        locations.add(`${a.country} · ${a.city}`);
      } else if (a.country) {
        locations.add(a.country);
      }
    });
    return Array.from(locations).sort();
  }, [agencies]);

  // Filter and sort agencies
  const filteredAgencies = useMemo(() => {
    return agencies
      .filter((agency) => {
        // Search term matching
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = agency.name.toLowerCase().includes(q);
          const matchContact = agency.contactName.toLowerCase().includes(q);
          const matchEmail = agency.email.toLowerCase().includes(q);
          const matchCity = agency.city.toLowerCase().includes(q);
          const matchCountry = agency.country.toLowerCase().includes(q);
          const matchAddress = agency.address.toLowerCase().includes(q);
          if (!matchName && !matchContact && !matchEmail && !matchCity && !matchCountry && !matchAddress) {
            return false;
          }
        }

        // Location filter
        if (selectedLocation !== 'All') {
          const locStr = `${agency.country} · ${agency.city}`;
          if (locStr !== selectedLocation && agency.country !== selectedLocation) {
            return false;
          }
        }

        // Verified filter
        if (verifiedFilter === 'Verified' && !agency.verified) {
          return false;
        }
        if (verifiedFilter === 'Unverified' && agency.verified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        // Newest first by createdAt
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });
  }, [agencies, searchTerm, selectedLocation, verifiedFilter, sortBy]);

  const verifiedCount = useMemo(() => {
    return agencies.filter((a) => a.verified).length;
  }, [agencies]);

  const hasActiveFilters = searchTerm !== '' || selectedLocation !== 'All' || verifiedFilter !== 'All' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('All');
    setVerifiedFilter('All');
    setSortBy('newest');
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim() || !formData.city.trim() || !formData.contactName.trim() || !formData.email.trim()) {
      showToast('Please fill in all required fields (Name, Country, City, Contact Person, Email).', 'error', 'Missing Information');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.createAgency({
        name: formData.name.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        verified: formData.verified,
        logo: formData.logo.trim(),
      });

      setAgencies((prev) => [created, ...prev]);
      showToast(`Agency "${created.name}" has been successfully added to our directory.`, 'success', 'Agency Registered');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        country: '',
        city: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        verified: true,
        logo: '',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create agency.', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO / BANNER HEADER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#111638] dark:via-[#141A44] dark:to-[#0D1233] text-[#171A2B] dark:text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-16 border-b border-[#D8DFEE] dark:border-[#252E63] overflow-hidden transition-colors">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF7817]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-96 h-96 bg-[#3B63E0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto space-y-6 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F667A] dark:text-slate-300">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[#5F667A] dark:text-slate-300 hover:text-[#FF7817] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
            <span className="text-[#FF7817]">Agencies</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/15 border border-[#FF7817]/30 text-xs font-bold text-[#FF7817] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7817]" />
                <span>Accredited Global Partners</span>
              </div>

              {/* Title & Subtitle matching layout requirements */}
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A2B] dark:text-white tracking-tight leading-tight">
                Agencies
              </h1>
              <p className="text-sm sm:text-base text-[#5F667A] dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Verified agencies on file. Connect with authorized representative agencies across
                trade, real estate, admissions advisory, and international operations.
              </p>
            </div>

            {/* Quick Action Button to Add Agency */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Register Agency</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#D8DFEE] dark:border-white/10 max-w-4xl">
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
              <span className="text-2xl font-black text-[#171A2B] dark:text-white block">
                {agencies.length}
              </span>
              <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                Agencies on File
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
              <span className="text-2xl font-black text-[#FF7817] block">
                {verifiedCount}
              </span>
              <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                Verified Partners
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
              <span className="text-2xl font-black text-[#3B63E0] block">
                {locationOptions.length}
              </span>
              <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                Strategic Hubs
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
              <span className="text-2xl font-black text-[#1F7A55] block">
                100%
              </span>
              <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                Direct Contact
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: TOOLBAR (SEARCH + FILTER BY CITY/COUNTRY)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 -mt-8 relative z-20">
        <div className="bg-white dark:bg-[#111638] rounded-2xl border border-gray-200/90 dark:border-[#202754] p-4 sm:p-5 shadow-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by agency name, contact person, or keyword..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white placeholder-[#6B7280] focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817] transition-colors"
                aria-label="Search agencies"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City / Country Filter Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] transition-colors cursor-pointer"
                aria-label="Filter by country or city"
              >
                <option value="All">All Countries & Cities</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status Filter */}
            <div className="md:col-span-2">
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] transition-colors cursor-pointer"
                aria-label="Filter by verification status"
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Pending Verification</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] transition-colors cursor-pointer"
                aria-label="Sort agencies"
              >
                <option value="newest">Newest on File</option>
                <option value="name">Agency Name (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Results Summary and Active Filter Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#202754] text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-[#0F1F4D] dark:text-white font-semibold">{filteredAgencies.length}</strong> of{' '}
                {agencies.length} registered agencies
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 ml-2 text-[#FF7817] hover:underline font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8A90A2]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1F7A55]" />
                Official Accreditation Guarantee
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: RESPONSIVE GRID (3 Desktop, 2 Tablet, 1 Mobile)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-16">
        {isLoading ? (
          /* Skeleton Loading Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111638] rounded-[16px] border border-gray-200 dark:border-[#202754] p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10" />
                  <div className="w-20 h-6 rounded-full bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-white/10 mt-4" />
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
                <div className="border-b border-gray-200 dark:border-white/10 my-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="border-b border-gray-200 dark:border-white/10 my-4" />
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAgencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                agency={agency}
                onClick={(selected) => setSelectedAgency(selected)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-[#111638] rounded-3xl border border-gray-200/80 dark:border-[#202754] p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FF7817]/10 dark:bg-[#151A46] border border-[#FF7817]/30 flex items-center justify-center mx-auto mb-4 text-[#FF7817]">
              <Building2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#0F1F4D] dark:text-white mb-2">
              No Agencies Match Your Search
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-6">
              We couldn't find any agencies matching your current query or location filters. Try
              adjusting your search keyword or clearing the filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1F4D] hover:bg-[#172b6b] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: AGENCY DETAIL MODAL (Interactive)
      ───────────────────────────────────────────────────────────── */}
      {selectedAgency && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedAgency(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="agency-modal-title"
        >
          <div
            className="bg-white dark:bg-[#111638] border border-gray-200/80 dark:border-[#202754] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedAgency(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Circular Avatar & Verified Badge */}
            <div className="flex items-start gap-4 pr-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center p-[3px] border border-[#FF7817] shrink-0 bg-white dark:bg-[#151A46]">
                <div className="w-full h-full rounded-full border border-dashed border-[#FF7817]/60 flex items-center justify-center bg-[#FF7817]/5 dark:bg-[#0B1030] overflow-hidden">
                  {selectedAgency.logo ? (
                    <img
                      src={selectedAgency.logo}
                      alt={selectedAgency.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-2xl font-light text-[#0F1F4D] dark:text-white uppercase">
                      {selectedAgency.name.trim().charAt(0) || 'A'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {selectedAgency.verified && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3F1EB] border border-[#A9D3C0] text-[#1F7A55] text-[10px] font-bold tracking-wider uppercase mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A55]" />
                    <span>VERIFIED AGENCY</span>
                  </div>
                )}
                <h2
                  id="agency-modal-title"
                  className="font-heading text-xl sm:text-2xl font-bold text-[#0F1F4D] dark:text-white leading-tight"
                >
                  {selectedAgency.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#3B63E0] mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {selectedAgency.country} · {selectedAgency.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-b border-dashed border-gray-200 dark:border-[#202754]" />

            {/* Contact details list */}
            <div className="space-y-3 text-xs sm:text-sm">
              {selectedAgency.contactName && (
                <div className="flex items-center gap-3 text-[#0F1F4D] dark:text-[#D9DDE8]">
                  <User className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Primary Contact</span>
                    <span className="font-semibold">{selectedAgency.contactName}</span>
                  </div>
                </div>
              )}

              {selectedAgency.email && (
                <div className="flex items-center gap-3 text-[#0F1F4D] dark:text-[#D9DDE8]">
                  <Mail className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Direct Email</span>
                    <a
                      href={`mailto:${selectedAgency.email}`}
                      className="hover:text-[#FF7817] hover:underline font-medium"
                    >
                      {selectedAgency.email}
                    </a>
                  </div>
                </div>
              )}

              {selectedAgency.phone && (
                <div className="flex items-center gap-3 text-[#0F1F4D] dark:text-[#D9DDE8]">
                  <Phone className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Telephone Hotline</span>
                    <a
                      href={`tel:${selectedAgency.phone}`}
                      className="hover:text-[#FF7817] hover:underline font-medium"
                    >
                      {selectedAgency.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedAgency.website && (
                <div className="flex items-center gap-3 text-[#0F1F4D] dark:text-[#D9DDE8]">
                  <Globe className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Official Portal</span>
                    <a
                      href={
                        selectedAgency.website.startsWith('http')
                          ? selectedAgency.website
                          : `https://${selectedAgency.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FF7817] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {selectedAgency.address && (
                <div className="flex items-start gap-3 text-[#0F1F4D] dark:text-[#D9DDE8]">
                  <Building2 className="w-4 h-4 text-[#FF7817] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Office Address</span>
                    <span>{selectedAgency.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              {selectedAgency.email && (
                <a
                  href={`mailto:${selectedAgency.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1F4D] hover:bg-[#1a2e6f] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>
              )}
              {selectedAgency.phone && (
                <a
                  href={`tel:${selectedAgency.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:border-[#FF7817] text-[#0F1F4D] dark:text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FF7817]" />
                  <span>Call Agency</span>
                </a>
              )}
            </div>

            {/* Footer Row */}
            <div className="border-t border-dashed border-gray-200 dark:border-[#202754] pt-3 flex items-center justify-between text-xs">
              <span className="font-bold tracking-wider text-[#6B7280] uppercase text-[11px]">
                ON FILE SINCE
              </span>
              <span className="font-semibold text-[#FF7817]">
                {new Date(selectedAgency.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: REGISTER / ADD AGENCY MODAL (Admin & Public)
      ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-agency-title"
        >
          <div
            className="bg-white dark:bg-[#111638] border border-gray-200/80 dark:border-[#202754] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202754] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider block">
                  Onboarding & Directory
                </span>
                <h2
                  id="register-agency-title"
                  className="font-heading text-xl sm:text-2xl font-bold text-[#0F1F4D] dark:text-white"
                >
                  Register New Agency
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                  Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Atlas Maritime & Trade Agency"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Dubai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. info@agency.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +971 4 883 2910"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Suite 408, Al Mina Towers, Port Rashid Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1F7A55] focus:ring-[#1F7A55] border-gray-300"
                />
                <label htmlFor="verified-checkbox" className="text-xs font-medium text-[#0F1F4D] dark:text-slate-200 cursor-pointer">
                  Mark as Verified Agency (Display verified green badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#202754]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-[#6B7280] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Save & Register Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

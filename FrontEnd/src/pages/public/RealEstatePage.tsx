import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  X,
  PhoneCall,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  Home,
  RotateCcw,
  Sparkles,
  Share2,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { Property } from '../../types';
import { api } from '../../services/api';
import { PropertyDetailPage } from './PropertyDetailPage';

export interface RealEstatePageProps {
  onNavigateHome: () => void;
  onNavigate: (page: string) => void;
  selectedProperty?: Property | null;
  onClearSelectedProperty?: () => void;
}

// Helper to parse city & country from location string
function parseLocation(loc?: string): { city: string; country: string } {
  if (!loc) return { city: 'Other', country: 'Other' };
  const parts = loc.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    return {
      city: parts[0],
      country: parts[parts.length - 1],
    };
  }
  return { city: loc, country: loc };
}

export const RealEstatePage: React.FC<RealEstatePageProps> = ({
  onNavigateHome,
  onNavigate,
  selectedProperty: externalSelectedProperty,
  onClearSelectedProperty,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Active property for dedicated full page view (NOT a popup)
  const [activeProperty, setActiveProperty] = useState<Property | null>(
    externalSelectedProperty || null
  );

  // Sync external property if passed
  useEffect(() => {
    if (externalSelectedProperty) {
      setActiveProperty(externalSelectedProperty);
    }
  }, [externalSelectedProperty]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBuyRent, setSelectedBuyRent] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'area-desc'>('newest');

  // Fetch properties on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProps = async () => {
      try {
        setLoading(true);
        const data = await api.getProperties();
        if (isMounted) {
          setProperties(data || []);
        }
      } catch (err) {
        console.error('Failed to load real estate listings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProps();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique Countries list dynamically from data
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      const { country } = parseLocation(p.location);
      if (country && country !== 'Other') set.add(country);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Compute Cities list dynamically based on selected Country
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      const { city, country } = parseLocation(p.location);
      if (selectedCountry === 'All' || country.toLowerCase() === selectedCountry.toLowerCase()) {
        if (city && city !== 'Other') set.add(city);
      }
    });
    return Array.from(set).sort();
  }, [properties, selectedCountry]);

  // When Country changes, reset City if not applicable
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('All');
  };

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        const { city, country } = parseLocation(p.location);

        // Search Query (title, location, description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchLoc = (p.location || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchDesc) return false;
        }

        // Country Filter
        if (selectedCountry !== 'All') {
          if (country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
        }

        // City Filter
        if (selectedCity !== 'All') {
          if (city.toLowerCase() !== selectedCity.toLowerCase()) return false;
        }

        // Property Type Filter
        if (selectedType !== 'All') {
          if (p.property_type !== selectedType) return false;
        }

        // Buy/Rent Filter
        if (selectedBuyRent !== 'All') {
          const trans = p.buy_rent || 'Sale';
          if (trans.toLowerCase() !== selectedBuyRent.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'area-desc') {
          return (b.area_sqft || b.sqm || 0) - (a.area_sqft || a.sqm || 0);
        }
        return 0;
      });
  }, [
    properties,
    searchQuery,
    selectedCountry,
    selectedCity,
    selectedType,
    selectedBuyRent,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedCity('All');
    setSelectedType('All');
    setSelectedBuyRent('All');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCountry !== 'All' ||
    selectedCity !== 'All' ||
    selectedType !== 'All' ||
    selectedBuyRent !== 'All';

  const handleOpenProperty = (prop: Property) => {
    setActiveProperty(prop);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a property is active, render the dedicated full page (NOT a popup modal)
  if (activeProperty) {
    return (
      <PropertyDetailPage
        property={activeProperty}
        allProperties={properties}
        onBack={() => {
          setActiveProperty(null);
          if (onClearSelectedProperty) onClearSelectedProperty();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectProperty={(p) => {
          setActiveProperty(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* Top Hero Banner */}
      <section className="relative w-full bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#111638] dark:via-[#141A44] dark:to-[#0D1233] text-[#171A2B] dark:text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-16 border-b border-[#D8DFEE] dark:border-[#202754] transition-colors">
        <div className="max-w-[1360px] mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F667A] dark:text-slate-300">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[#5F667A] dark:text-slate-300 hover:text-[#FF7817] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#FF7817]">Real Estate Portfolio</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7817]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Real Estate Assets</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-[#171A2B] dark:text-white tracking-tight leading-tight">
              Prime Properties & Strategic Investments
            </h1>
            <p className="text-sm sm:text-base text-[#5F667A] dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              Browse premier commercial complexes, luxury sea facing residences, and strategic land
              holdings across Somalia, Turkey, the United Arab Emirates, and regional commercial hubs.
            </p>
          </div>

          {/* Quick Stats Line */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D8DFEE] dark:border-white/10 max-w-3xl">
            <div>
              <span className="text-2xl font-black text-[#171A2B] dark:text-white">{properties.length}</span>
              <p className="text-xs text-[#5F667A] dark:text-slate-300">Registered Listings</p>
            </div>
            <div>
              <span className="text-2xl font-black text-[#FF7817]">
                {availableCountries.length}
              </span>
              <p className="text-xs text-[#5F667A] dark:text-slate-300">Global Markets</p>
            </div>
            <div>
              <span className="text-2xl font-black text-[#171A2B] dark:text-white">
                {properties.filter((p) => (p.location || '').includes('Somalia')).length}
              </span>
              <p className="text-xs text-[#5F667A] dark:text-slate-300">Somalia Portfolio</p>
            </div>
            <div>
              <span className="text-2xl font-black text-[#171A2B] dark:text-white">
                {properties.filter((p) => (p.location || '').includes('Turkey')).length}
              </span>
              <p className="text-xs text-[#5F667A] dark:text-slate-300">Turkey Portfolio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter Suite & Directory */}
      <section className="max-w-[1360px] mx-auto py-10 px-4 sm:px-8 lg:px-16 space-y-8">
        {/* Comprehensive Filter Panel */}
        <div className="bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] p-5 sm:p-6 shadow-sm space-y-5">
          {/* Row 1: Search & Primary Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-[#8A90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location, keywords..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:border-[#FF7817]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Country Selector (Requested by User) */}
            <div className="lg:col-span-3 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] mb-1">
                Country
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#FF7817] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817] appearance-none cursor-pointer"
                >
                  <option value="All">All Countries ({availableCountries.length})</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c === 'Somalia' ? '🇸🇴 Somalia' : c === 'Turkey' ? '🇹🇷 Turkey' : c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8A90A2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* City Selector (Dynamically populated based on Country) */}
            <div className="lg:col-span-3 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] mb-1">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#FF7817] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={availableCities.length === 0}
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817] appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="All">
                    {selectedCountry === 'All'
                      ? 'All Cities'
                      : `All in ${selectedCountry} (${availableCities.length})`}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8A90A2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="lg:col-span-2 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] mb-1">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817] appearance-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Plot">Plot / Land</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8A90A2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Controls (Buy/Rent, Sort & Reset) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#EEF2F8] dark:border-[#1E2554]">
            {/* Transaction Segmented Control */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0F3F9] dark:bg-[#0B1030] border border-[#DFE4EE] dark:border-[#202754]">
              {['All', 'Sale', 'Rent'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedBuyRent(option)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBuyRent === option
                      ? 'bg-white dark:bg-[#1C2356] text-[#FF7817] shadow-xs'
                      : 'text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#171A2B] dark:hover:text-white'
                  }`}
                >
                  {option === 'All' ? 'All Listings' : option === 'Sale' ? 'For Sale' : 'For Rent'}
                </button>
              ))}
            </div>

            {/* Quick Country Shortlinks */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-[#8A90A2] font-medium">Quick Country:</span>
              <button
                type="button"
                onClick={() => handleCountryChange('Somalia')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedCountry === 'Somalia'
                    ? 'bg-[#FF7817] text-white'
                    : 'bg-[#F0F3F9] dark:bg-white/5 text-[#485068] dark:text-[#BAC3DC] hover:text-[#FF7817]'
                }`}
              >
                🇸🇴 Somalia
              </button>
              <button
                type="button"
                onClick={() => handleCountryChange('Turkey')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedCountry === 'Turkey'
                    ? 'bg-[#FF7817] text-white'
                    : 'bg-[#F0F3F9] dark:bg-white/5 text-[#485068] dark:text-[#BAC3DC] hover:text-[#FF7817]'
                }`}
              >
                🇹🇷 Turkey
              </button>
            </div>

            {/* Sort & Reset Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A90A2] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="area-desc">Area: Largest First</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-[#5F667A] dark:text-[#AAB2CA]">
          <div>
            Showing <strong className="text-[#151A46] dark:text-white">{filteredProperties.length}</strong>{' '}
            properties
            {selectedCountry !== 'All' && (
              <span>
                {' '}
                in <strong className="text-[#FF7817]">{selectedCountry}</strong>
              </span>
            )}
            {selectedCity !== 'All' && (
              <span>
                {' '}
                (City: <strong className="text-[#FF7817]">{selectedCity}</strong>)
              </span>
            )}
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white dark:bg-white/5 border border-[#DFE4EE] dark:border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#12183F] border border-[#DFE4EE] dark:border-[#1E2554] max-w-lg mx-auto space-y-4">
            <Building2 className="w-12 h-12 text-[#FF7817] mx-auto opacity-70" />
            <h3 className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
              No Properties Found
            </h3>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              No registered listings currently match your selected filters for{' '}
              <strong>{selectedCountry !== 'All' ? selectedCountry : 'the query'}</strong>. Try
              broadening your criteria or resetting filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#151A46] hover:bg-[#FF7817] dark:bg-white/10 dark:hover:bg-[#FF7817] rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => {
              const imageSrc =
                prop.image ||
                (prop.gallery && prop.gallery[0]) ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80';

              return (
                <div
                  key={prop.id}
                  onClick={() => handleOpenProperty(prop)}
                  className="group bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
                >
                  {/* Photo Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={imageSrc}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    {/* Unboxed tags */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#151A46]/90 text-white backdrop-blur-md">
                        {prop.property_type || 'Residential'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#FF7817] text-white">
                        For {prop.buy_rent || 'Sale'}
                      </span>
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">
                          Offering Price
                        </span>
                        <p className="font-heading text-2xl font-black text-white">
                          ${prop.price ? prop.price.toLocaleString() : 'Price on Inquiry'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white group-hover:text-[#FF7817] transition-colors line-clamp-1">
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#6F7792] dark:text-[#A0ABC6]">
                        <MapPin className="w-3.5 h-3.5 text-[#FF7817] shrink-0" />
                        <span className="truncate">{prop.location || prop.address || 'Prime Urban District'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA] line-clamp-2 leading-relaxed font-normal">
                      {prop.description ||
                        'Exceptional institutional asset offering high rental yield, prime location, and legal title clearance.'}
                    </p>

                    {/* Neighborhood & Specs Mini Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#F0F3F9] dark:bg-white/5 text-[10px] font-semibold text-[#485068] dark:text-[#AAB2CA]">
                        {prop.furnishing_status || 'Furnished'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#F0F3F9] dark:bg-white/5 text-[10px] font-semibold text-[#485068] dark:text-[#AAB2CA]">
                        Direct Road Access
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FF7817]/10 dark:bg-[#FF7817]/20 text-[10px] font-semibold text-[#FF7817]">
                        Masjid {prop.masjid || 'Near'}
                      </span>
                    </div>

                    {/* Clean specs */}
                    <div className="pt-3 border-t border-[#EDF1F7] dark:border-[#1E2554] flex items-center justify-between text-xs text-[#4F566B] dark:text-[#C5CCE0]">
                      {prop.bedrooms !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-[#FF7817]" />
                          <span>{prop.bedrooms} Beds</span>
                        </div>
                      )}
                      {prop.bathrooms !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-[#FF7817]" />
                          <span>{prop.bathrooms} Baths</span>
                        </div>
                      )}
                      {(prop.area_sqft || prop.sqm) && (
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-[#FF7817]" />
                          <span>{prop.area_sqft ? `${prop.area_sqft} sqft` : `${prop.sqm} sqm`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

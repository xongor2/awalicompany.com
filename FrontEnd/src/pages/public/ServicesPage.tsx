import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  GraduationCap,
  Briefcase,
  Globe2,
  Building,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  ChevronRight,
  X,
  Calendar,
  Check,
  Building2,
  RefreshCw,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Service } from '../../types';
import { api } from '../../services/api';

const universityLogos = [
  { src: '/images/UN-slide-emage/شعار-الجامعات-بالصفحة-الرئيسية.jpg', alt: 'Partner university logo 1' },
  { src: '/images/UN-slide-emage/شعار-الجامعات-بالصفحة-الرئيسية-3.jpg', alt: 'Partner university logo 2' },
  { src: '/images/UN-slide-emage/شعار-الجامعات-بالصفحة-الرئيسية-4.jpg', alt: 'Partner university logo 3' },
  { src: '/images/UN-slide-emage/شعار-الجامعات-بالصفحة-الرئيسية-5.jpg', alt: 'Partner university logo 4' },
  { src: '/images/UN-slide-emage/شعار-الجامعات-بالصفحة-الرئيسية-6.jpg', alt: 'Partner university logo 5' },
  { src: '/images/UN-slide-emage/جامعة-نيشان-تاشي-.webp', alt: 'Nişantaşı University' },
  { src: '/images/UN-slide-emage/جامعة-ميديبول-.webp', alt: 'Istanbul Medipol University' },
  { src: '/images/UN-slide-emage/جامعة-كينت.webp', alt: 'Istanbul Kent University' },
  { src: '/images/UN-slide-emage/جامعة-جيليشيم-1-1.webp', alt: 'Istanbul Gelişim University' },
  { src: '/images/UN-slide-emage/جامعة-توبكابي-.webp', alt: 'Istanbul Topkapı University' },
  { src: '/images/UN-slide-emage/جامعة-ايدن.webp', alt: 'Istanbul Aydın University' },
  { src: '/images/UN-slide-emage/جامعة-البيروني.webp', alt: 'Biruni University' },
  { src: '/images/UN-slide-emage/جامعة-اسكودار.webp', alt: 'Üsküdar University' },
];

const UniversityLogoSlider: React.FC = () => (
  <section
    aria-label="Partner universities"
    className="border-b border-[#D8DFEE] dark:border-[#202754] bg-white dark:bg-[#0E1438] py-7 sm:py-9 overflow-hidden"
  >
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 mb-5">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-[#FF7817]" />
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#5F667A] dark:text-[#AAB2CA]">
          Our Partner Universities
        </p>
      </div>
    </div>

    <div className="relative">
      <div className="absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-white dark:from-[#0E1438] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-white dark:from-[#0E1438] to-transparent pointer-events-none" />
      <div className="university-logo-marquee flex">
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1}
            className="flex shrink-0 items-center gap-7 sm:gap-10 pr-7 sm:pr-10"
          >
            {universityLogos.map((logo) => (
              <div
                key={`${copyIndex}-${logo.src}`}
                className="flex h-20 w-32 sm:h-24 sm:w-40 shrink-0 items-center justify-center rounded-xl border border-[#E2E6EF] dark:border-[#252B5C] bg-white px-4 py-3 shadow-xs"
              >
                <img
                  src={logo.src}
                  alt={copyIndex === 0 ? logo.alt : ''}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export interface ServicesPageProps {
  initialCategory?: string;
  onNavigateHome: () => void;
  onNavigate: (page: string) => void;
  onOpenPortal?: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  initialCategory,
  onNavigateHome,
  onNavigate,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'Consulting'
  );
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');

  // Detect whether page is displaying Education or Consulting
  const isEducation = Boolean(
    (initialCategory && initialCategory.toLowerCase() === 'education') ||
    (selectedCategory && selectedCategory.toLowerCase() === 'education')
  );

  // Modal inspection state
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Sync initialCategory if prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch all services from database
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getServices();
      setServices(data || []);
    } catch (err: any) {
      console.error('Failed to load services:', err);
      setError(err?.message || 'Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filtered and sorted services for Education or Consulting
  const filteredServices = useMemo(() => {
    const targetCategory = isEducation ? 'education' : 'consulting';
    const dbItems = services.filter(
      (srv) => srv.category && srv.category.toLowerCase() === targetCategory
    );

    return dbItems
      .filter((srv) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = srv.name?.toLowerCase().includes(q);
          const matchDesc = srv.description?.toLowerCase().includes(q);
          const matchFeatures = srv.features?.some((f) =>
            f.toLowerCase().includes(q)
          );
          if (!matchName && !matchDesc && !matchFeatures) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    services,
    isEducation,
    searchTerm,
    sortBy,
  ]);

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'Education':
        return {
          icon: <GraduationCap className="w-4 h-4" />,
          color: 'bg-[#151A46]/10 text-[#151A46] dark:text-[#BAC3DC] border-[#151A46]/20',
          badgeBg: 'bg-[#151A46] text-white',
        };
      case 'Consulting':
        return {
          icon: <Briefcase className="w-4 h-4" />,
          color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
          badgeBg: 'bg-blue-600 text-white',
        };
      case 'Import / Export':
        return {
          icon: <Globe2 className="w-4 h-4" />,
          color: 'bg-[#FF7817]/10 text-[#D95F06] dark:text-[#FF9240] border-[#FF7817]/30',
          badgeBg: 'bg-[#FF7817] text-white',
        };
      case 'Real Estate':
      default:
        return {
          icon: <Building className="w-4 h-4" />,
          color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
          badgeBg: 'bg-indigo-600 text-white',
        };
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    setTimeout(() => {
      setIsSubmittingInquiry(false);
      setInquirySuccess(true);
      setTimeout(() => {
        setIsInquirySuccessDismiss();
      }, 2500);
    }, 600);
  };

  const setIsInquirySuccessDismiss = () => {
    setInquirySuccess(false);
    setIsInquiryModalOpen(false);
    setActiveModalService(null);
    setInquiryForm({ fullName: '', phone: '', email: '', notes: '' });
  };

  const openServiceInquiry = (service: Service) => {
    setActiveModalService(service);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="w-full bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors min-h-screen">
      {/* Top Banner / Hero Zone */}
      <section className="relative w-full bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#111638] dark:via-[#141A44] dark:to-[#0D1233] text-[#171A2B] dark:text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-16 overflow-hidden border-b border-[#D8DFEE] dark:border-[#202754] transition-colors">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7817]/20 via-transparent to-[#FF7817]/5 opacity-40 dark:opacity-80 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF7817]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[#5F667A] dark:text-[#D9DDE8] hover:text-[#FF7817] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
            <span className="text-[#FF7817]">
              {isEducation
                ? 'Education & Global University Advisory'
                : 'Consulting & Strategic Advisory'}
            </span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/15 dark:bg-[#FF7817]/20 border border-[#FF7817]/30 dark:border-[#FF7817]/40 text-xs font-bold text-[#FF7817] uppercase tracking-wider">
              {isEducation ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-[#FF7817]" />
                  <span>AW Ali Global Education Division</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7817]" />
                  <span>AW Ali Corporate Consulting Division</span>
                </>
              )}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171A2B] dark:text-white tracking-tight">
              {isEducation
                ? 'International Education & Global University Placement'
                : 'Strategic Corporate Consulting & Business Advisory'}
            </h1>

            <p className="text-sm sm:text-base text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed max-w-2xl font-normal">
              {isEducation
                ? 'Comprehensive foreign academic admissions, scholarship applications, student visa advisory, and university matching across Turkey, the United Kingdom, Europe, Malaysia, the United States, and Canada.'
                : 'Specialized management consulting, commercial feasibility studies, regulatory compliance, corporate governance, and organizational transformation led by AW Ali senior partners across Somalia and East Africa.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#D8DFEE] dark:border-white/10 max-w-4xl">
            {isEducation ? (
              <>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#FF7817] block">
                    1,250+
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Students Placed Abroad
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#171A2B] dark:text-white block">
                    98%
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Visa Success Rate
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#FF7817] block">
                    45+
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Partner Universities
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                    100%
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Admissions Advisory
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#FF7817] block">
                    {filteredServices.length}
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Active Consulting Practices
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#171A2B] dark:text-white block">
                    100%
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Tailored Deliverables
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-[#FF7817] block">
                    Senior
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Lead Partner Engagement
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[#D8DFEE] dark:border-white/10 backdrop-blur-xs shadow-2xs">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                    Global
                  </span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2] font-medium uppercase tracking-wider">
                    Cross Border Presence
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {isEducation && <UniversityLogoSlider />}

      {/* Main Services Filter & Gallery Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 space-y-10">
        {/* Controls: Search, Categories, Sort */}
        <div className="bg-white dark:bg-[#111638] rounded-2xl p-5 sm:p-6 border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-[#8A90A2] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isEducation
                    ? 'Search academic programs, universities, scholarships, or visa services...'
                    : 'Search consulting practices by capability, domain, or deliverable...'
                }
                className="w-full pl-11 pr-10 py-3 text-sm rounded-xl bg-[#F8F9FC] dark:bg-[#151A46]/70 border border-[#D9DDE8] dark:border-[#252B5C] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Refresh */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-[#5F667A] dark:text-[#AAB2CA]">
                Sort by:
              </span>
              <div className="flex items-center bg-[#F8F9FC] dark:bg-[#151A46] rounded-xl p-1 border border-[#D9DDE8] dark:border-[#252B5C]">
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    sortBy === 'newest'
                      ? 'bg-[#151A46] text-white dark:bg-[#FF7817]'
                      : 'text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#171A2B] dark:hover:text-white'
                  }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    sortBy === 'name'
                      ? 'bg-[#151A46] text-white dark:bg-[#FF7817]'
                      : 'text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#171A2B] dark:hover:text-white'
                  }`}
                >
                  Alphabetical
                </button>
              </div>

              <button
                type="button"
                onClick={loadServices}
                title={isEducation ? 'Refresh academic programs' : 'Refresh consulting practices'}
                className="p-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#FF7817] hover:border-[#FF7817] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF7817]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-xs text-[#8A90A2] px-1 font-semibold">
          <div>
            Showing <span className="font-bold text-[#171A2B] dark:text-white">{filteredServices.length}</span>{' '}
            {isEducation
              ? 'Academic & Global University Placement Programs'
              : 'Strategic Consulting & Advisory Practices'}
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#FF7817] hover:underline font-bold cursor-pointer"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Service Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111638] rounded-2xl border border-[#E2E6EF] dark:border-[#202754] p-5 space-y-4 animate-pulse"
              >
                <div className="w-full h-52 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="flex gap-2">
                  <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-lg mx-auto space-y-4">
            <Info className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-red-600 dark:text-red-400">
              Unable to load services
            </h3>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA]">{error}</p>
            <button
              type="button"
              onClick={loadServices}
              className="px-5 py-2 text-xs font-bold text-white bg-[#151A46] rounded-xl hover:bg-[#FF7817] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-[#111638] rounded-3xl border border-[#E2E6EF] dark:border-[#202754] max-w-2xl mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817] mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
              No services found
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#AAB2CA] max-w-md mx-auto">
              We couldn't find any services matching your search or category filter. Try clearing your filters or refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#151A46] dark:bg-[#FF7817] rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const catDetails = getCategoryDetails(service.category);
              return (
                <div
                  key={service.id}
                  className="group flex flex-col bg-white dark:bg-[#111638] rounded-2xl border border-[#E2E6EF] dark:border-[#202754] overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/50 transition-all duration-300"
                >
                  {/* Service Card Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                    <img
                      src={
                        service.image ||
                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${catDetails.color} bg-white/90 dark:bg-[#0B1030]/90 shadow-xs`}
                      >
                        {catDetails.icon}
                        <span>{service.category}</span>
                      </span>
                    </div>

                    {/* Active Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF7817]/90 text-white backdrop-blur-md shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </div>

                    {/* Bottom overlay title for high contrast */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[11px] font-semibold text-white/80 block uppercase tracking-wider">
                        AW Ali Division
                      </span>
                    </div>
                  </div>

                  {/* Service Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white line-clamp-2 group-hover:text-[#FF7817] transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    {/* Key Features Bullet Tags */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E2E6EF] dark:border-[#202754]">
                        <span className="text-[11px] font-bold text-[#8A90A2] uppercase tracking-wider block">
                          Included Deliverables:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F8F9FC] dark:bg-[#151A46]/70 text-[#171A2B] dark:text-[#D9DDE8] border border-[#E2E6EF] dark:border-[#252B5C]"
                            >
                              <Check className="w-3 h-3 text-[#FF7817] shrink-0" />
                              <span className="truncate max-w-[140px]">{feat}</span>
                            </span>
                          ))}
                          {service.features.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold bg-[#FF7817]/10 text-[#FF7817]">
                              +{service.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="pt-4 flex items-center gap-2 border-t border-[#E2E6EF] dark:border-[#202754]">
                      <button
                        type="button"
                        onClick={() => setActiveModalService(service)}
                        className="flex-1 py-2.5 px-3 text-xs font-bold text-[#151A46] dark:text-white bg-[#F8F9FC] dark:bg-[#151A46] hover:bg-[#FF7817] hover:text-white dark:hover:bg-[#FF7817] rounded-xl transition-all text-center cursor-pointer border border-[#D9DDE8] dark:border-[#252B5C] hover:border-transparent"
                      >
                        Learn More
                      </button>

                      <a
                        href={`https://wa.me/252613295050?text=${encodeURIComponent(
                          `Hello AW Ali Company, I am interested in your service: ${service.name}. Please provide more details.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#151A46] hover:bg-[#1E2554] text-white transition-all shadow-xs"
                        title="Direct WhatsApp Inquiry (+252613295050)"
                      >
                        <MessageCircle className="w-4 h-4 text-[#FF7817]" />
                      </a>

                      <button
                        type="button"
                        onClick={() => openServiceInquiry(service)}
                        className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white transition-all shadow-xs cursor-pointer"
                        title="Book Service Consultation"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Division Callout Card */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-[#151A46] via-[#1C235A] to-[#151A46] text-white p-8 sm:p-12 border border-[#202754] relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-full bg-[#FF7817]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#FF7817]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {isEducation
                    ? 'Global Education & Admissions Desk'
                    : 'Custom Corporate Advisory Solutions'}
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {isEducation
                  ? 'Ready to Secure Your Admission & Student Visa Abroad?'
                  : 'Require a Tailored Consultancy or Corporate Advisory?'}
              </h3>
              <p className="text-sm text-[#D9DDE8] leading-relaxed">
                {isEducation
                  ? 'AW Ali Education advisors guide students and parents step-by-step from university selection and scholarship filing to visa processing and arrival abroad. Speak directly with our international admissions counselors.'
                  : 'AW Ali Company crafts custom service agreements for corporate clients, institutional developers, and commercial enterprises. Speak directly with our lead partners.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/252613295050?text=${encodeURIComponent(
                  isEducation
                    ? 'Hello AW Ali Education Division, I would like to inquire about university admissions and international scholarships.'
                    : 'Hello AW Ali Consulting Division, I would like to inquire about strategic corporate consulting services.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white text-xs font-bold transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +252613295050</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#151A46] border border-white/20 hover:border-[#FF7817] hover:text-[#FF7817] text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Official Office</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal 1: Full Service Overview Modal */}
      {activeModalService && !isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111638] rounded-3xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-64 sm:h-72 w-full shrink-0">
              <img
                src={
                  activeModalService.image ||
                  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'
                }
                alt={activeModalService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-[#FF7817] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FF7817] text-white">
                  {activeModalService.category}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalService.name}
                </h2>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8A90A2] uppercase tracking-wider">
                  Service Description & Strategic Scope
                </h4>
                <p className="text-sm sm:text-base text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
                  {activeModalService.description}
                </p>
              </div>

              {activeModalService.features && activeModalService.features.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#E2E6EF] dark:border-[#202754]">
                  <h4 className="text-xs font-bold text-[#8A90A2] uppercase tracking-wider">
                    Full Features & Deliverables Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModalService.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#151A46]/60 border border-[#E2E6EF] dark:border-[#252B5C]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FF7817] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[#171A2B] dark:text-white">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service guarantee highlight */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#FF7817]" />
                <span>
                  Backed by AW Ali Company’s verified quality standards and direct client advisory team in Mogadishu, Hargeisa, and Istanbul.
                </span>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 sm:p-6 bg-[#F8F9FC] dark:bg-[#0E1235] border-t border-[#E2E6EF] dark:border-[#202754] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#8A90A2]">
                Official Hotline:{' '}
                <a
                  href="tel:+252613295050"
                  className="font-bold text-[#171A2B] dark:text-white hover:text-[#FF7817]"
                >
                  +252613295050
                </a>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/252613295050?text=${encodeURIComponent(
                    `Hello AW Ali Company, I am inquiring about the ${activeModalService.name} service.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#151A46] hover:bg-[#1E2554] rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF7817]" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#FF7817] hover:bg-[#E66606] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Request Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Inquiry / Booking Form Modal */}
      {isInquiryModalOpen && activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111638] rounded-3xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E6EF] dark:border-[#202754] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider block">
                  {isEducation
                    ? 'Education & Admissions Consultation'
                    : 'Corporate Advisory Consultation'}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                  {activeModalService.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FF7817]/20 text-[#FF7817] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                  Consultation Request Received!
                </h4>
                <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] max-w-sm mx-auto">
                  Thank you! An AW Ali advisory specialist will reach out to you within 24 hours at the provided phone number.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.fullName}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, fullName: e.target.value })
                    }
                    placeholder="e.g. Hassan Mohamed"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8F9FC] dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, phone: e.target.value })
                      }
                      placeholder="+252 61..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8F9FC] dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, email: e.target.value })
                      }
                      placeholder="client@example.com"
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8F9FC] dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                    Requirements or Specific Questions
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryForm.notes}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, notes: e.target.value })
                    }
                    placeholder={
                      isEducation
                        ? "Tell us about your target degree, preferred country (Turkey, UK, Malaysia, etc.), and academic background..."
                        : "Tell us about your organization's timeline, scope of work, or strategic requirements..."
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F8F9FC] dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#171A2B] dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#FF7817] hover:bg-[#E66606] rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingInquiry ? 'Sending...' : 'Submit Consultation Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  Briefcase,
  Globe2,
  Building,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Service } from '../../types';
import { api } from '../../services/api';

export interface ServicesSectionProps {
  onNavigate: (page: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await api.getServices();
        if (isMounted) {
          // Sort newest first by created_at and pick the 3 latest
          const sorted = [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setServices(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch services for homepage:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Education':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          color:
            'bg-[#151A46]/10 dark:bg-[#151A46]/30 text-[#151A46] dark:text-[#BAC3DC] border-[#151A46]/20',
        };
      case 'Consulting':
        return {
          icon: <Briefcase className="w-3.5 h-3.5" />,
          color:
            'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
        };
      case 'Import / Export':
        return {
          icon: <Globe2 className="w-3.5 h-3.5" />,
          color:
            'bg-[#FF7817]/10 dark:bg-[#FF7817]/20 text-[#D95F06] dark:text-[#FF9240] border-[#FF7817]/30',
        };
      case 'Real Estate':
      default:
        return {
          icon: <Building className="w-3.5 h-3.5" />,
          color:
            'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
        };
    }
  };

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors border-b border-[#E2E6EF] dark:border-[#1E2554]">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#FF7817]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10 space-y-14">
        {/* Section Header with exact copy from user request */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/10 dark:bg-[#FF7817]/15 border border-[#FF7817]/25 text-xs font-bold text-[#D95F06] dark:text-[#FF7817] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Services</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151A46] dark:text-white tracking-tight leading-tight">
            What We Do Best
          </h2>

          <p className="text-base sm:text-lg text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed font-normal">
            We provide tailored solutions in education, consulting, and global trade. Our services
            empower individuals and businesses to grow, adapt, and succeed in a rapidly changing world.
          </p>
        </div>

        {/* 3 Dynamic Service Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#111638] rounded-2xl border border-[#E2E6EF] dark:border-[#202754] overflow-hidden shadow-xs animate-pulse"
              >
                <div className="h-56 bg-slate-200 dark:bg-slate-800" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] max-w-xl mx-auto space-y-3">
            <Layers className="w-10 h-10 text-[#FF7817] mx-auto opacity-70" />
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              New Services Coming Soon
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#AAB2CA]">
              No services found at this moment. You can add services through the administrative dashboard to highlight them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const badge = getCategoryBadge(service.category);
              const title = service.name || service.title || 'Specialized Service';

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="group bg-white dark:bg-[#111638] rounded-2xl border border-[#E2E6EF] dark:border-[#202754] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Card Thumbnail */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={
                        service.image ||
                        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Pill Tag */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badge.color} bg-white/90 dark:bg-[#111638]/90 shadow-xs`}
                      >
                        {badge.icon}
                        <span>{service.category}</span>
                      </span>
                    </div>

                    {/* Status Badge */}
                    {service.status === 'Active' && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF7817]/20 text-[#FF7817] dark:text-[#FF9240] border border-[#FF7817]/30 backdrop-blur-md">
                          Available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-heading text-xl font-bold text-[#151A46] dark:text-white group-hover:text-[#FF7817] transition-colors line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed line-clamp-3 font-normal">
                        {service.description}
                      </p>
                    </div>

                    {/* Features Snippet */}
                    {service.features && service.features.length > 0 && (
                      <div className="pt-2 border-t border-[#EEF2F8] dark:border-[#1E2554] space-y-1.5">
                        {service.features.slice(0, 2).map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-[#4F566B] dark:text-[#C5CCE0]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7817] shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Action Link */}
                    <div className="pt-3 border-t border-[#EEF2F8] dark:border-[#1E2554] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FF7817] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        <span>Service Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] text-[#8A90A2]">
                        {new Date(service.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section Bottom Action: Navigate to full consulting page */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => onNavigate('consulting')}
            className="group inline-flex items-center gap-3 px-8 py-3.5 text-sm font-bold text-white bg-[#151A46] hover:bg-[#FF7817] dark:bg-white/10 dark:hover:bg-[#FF7817] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Explore Consulting & Advisory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Service Detail Modal for Homepage Card Preview */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111638] rounded-2xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header Image */}
            <div className="relative h-64 w-full shrink-0">
              <img
                src={
                  selectedService.image ||
                  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'
                }
                alt={selectedService.name || selectedService.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-[#FF7817] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FF7817] text-white mb-2 shadow-xs">
                  {selectedService.category}
                </span>
                <h3 className="font-heading text-2xl font-bold text-white leading-tight">
                  {selectedService.name || selectedService.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A90A2] mb-2">
                  Service Overview
                </h4>
                <p className="text-sm text-[#4F566B] dark:text-[#C8CFE2] leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {selectedService.features && selectedService.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A90A2] mb-3">
                    Key Features & Inclusions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedService.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#E2E6EF] dark:border-white/10 text-xs font-medium text-[#151A46] dark:text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FF7817] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#EEF2F8] dark:border-[#1E2554] flex items-center justify-between">
                <span className="text-xs text-[#8A90A2]">
                  Status:{' '}
                  <span className="font-bold text-[#FF7817]">
                    {selectedService.status}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    onNavigate('contact');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  <span>Request This Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

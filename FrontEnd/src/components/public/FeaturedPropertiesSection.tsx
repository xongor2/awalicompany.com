import React, { useEffect, useState } from 'react';
import {
  Building2,
  MapPin,
  ArrowRight,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Sparkles,
  CheckCircle2,
  X,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { Property } from '../../types';
import { api } from '../../services/api';

export interface FeaturedPropertiesSectionProps {
  onNavigate: (page: string) => void;
  onSelectProperty?: (property: Property) => void;
}

export const FeaturedPropertiesSection: React.FC<FeaturedPropertiesSectionProps> = ({
  onNavigate,
  onSelectProperty,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProperties = async () => {
      try {
        const data = await api.getProperties();
        if (isMounted) {
          // Sort to show active & newest properties, top 3
          const filtered = (data || [])
            .filter((p) => p.status === 'Active' || p.status === 'Pending')
            .sort(
              (a, b) =>
                new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
            )
            .slice(0, 3);
          setProperties(filtered);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePropertyClick = (prop: Property) => {
    if (onSelectProperty) {
      onSelectProperty(prop);
    } else {
      onNavigate('real-estate');
    }
  };

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[#F4F7FC] dark:bg-[#0E1338] transition-colors border-b border-[#E2E6EF] dark:border-[#1E2554]">
      {/* Background architectural grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#151A46_1px,transparent_1px)] dark:bg-[radial-gradient(#FF7817_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E2E6EF] dark:border-[#1E2554] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7817]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Portfolio</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151A46] dark:text-white tracking-tight leading-tight">
              Prime Commercial & High-Value Assets
            </h2>
            <p className="text-base sm:text-lg text-[#555E78] dark:text-[#BAC3DC] leading-relaxed">
              Explore premier commercial complexes, strategic development plots, and luxury
              residential investments curated by AW Ali Company's real estate division.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('real-estate')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#151A46] hover:bg-[#FF7817] dark:bg-white/10 dark:hover:bg-[#FF7817] transition-all cursor-pointer shadow-xs"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-white dark:bg-white/5 border border-[#E2E6EF] dark:border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754]">
            <Building2 className="w-12 h-12 text-[#FF7817] mx-auto opacity-60 mb-3" />
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Portfolio Assets Under Curation
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#AAB2CA] max-w-md mx-auto mt-1">
              Our real estate listings are regularly updated with new acquisition and leasehold opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => {
              const imageSrc =
                prop.image ||
                (prop.gallery && prop.gallery[0]) ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80';

              return (
                <div
                  key={prop.id}
                  onClick={() => handlePropertyClick(prop)}
                  className="group bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
                >
                  {/* Photo Container */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={imageSrc}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Clean unboxed tag over photo */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#151A46]/90 text-white backdrop-blur-md">
                        {prop.property_type || 'Commercial'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#FF7817] text-white">
                        For {prop.buy_rent || 'Sale'}
                      </span>
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-300 font-medium">
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
                      {prop.description || 'Exclusive real estate asset offering exceptional rental yield and strategic location advantages.'}
                    </p>

                    {/* Property Specs (Anti-slop clean metadata) */}
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
      </div>
    </section>
  );
};

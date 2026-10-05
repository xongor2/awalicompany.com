import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  PhoneCall,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Building2,
  Sparkles,
  Home,
  Check,
  Clock,
  Compass,
  FileCheck,
  Send,
  MessageCircle,
  Navigation,
  ShoppingBag,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { Property } from '../../types';

function RoadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.2 3.8H5.8L2 20.2h6.8l1-5.2h4.4l1 5.2H22L18.2 3.8zm-4.7 9h-2.9l0.9-4.8h1.1l0.9 4.8z" />
    </svg>
  );
}

function CartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2 3h3.2l2.3 11a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2l1.6-7H5.8" />
    </svg>
  );
}

function SofaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 9.5V7c0-1.66-1.34-3-3-3H7C5.34 4 4 5.34 4 7v2.5C2.9 9.5 2 10.4 2 11.5v4.5h1.5l.8 3c.1.4.5.7 1 .7h.3c.6 0 1.1-.5 1-1.1L6 16h12l-.6 2.6c-.1.6.4 1.1 1 1.1h.3c.5 0 .9-.3 1-.7l.8-3H22v-4.5c0-1.1-.9-2-2-2zM6 7c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v2.5H6V7zm14 7.5H4v-3c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v3z" />
    </svg>
  );
}

function MosqueIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 10.5h2.5V21H4v-10.5zm.5-5.2c0-.7.4-1.3 1-1.6V2.5h.5v1.2c.6.3 1 .9 1 1.6 0 .7-.4 1.3-1 1.6V9H5V6.9c-.6-.3-1-.9-1-1.6zm8-3.3c-.3 0-.5.2-.5.5v1.3c-2.6.6-4.5 3-4.5 5.7h-1V21h15V9.5h-1c0-2.7-1.9-5.1-4.5-5.7V2.5c0-.3-.2-.5-.5-.5zm-2.5 18v-4.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V21h-3zm4.5 0v-4c0-.6.4-1 1-1s1 .4 1 1V21h-2z" />
    </svg>
  );
}

function CardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="2" y="4.5" width="20" height="15" rx="3.5" fill="currentColor" />
      <rect x="2" y="8" width="20" height="2.8" fill="white" className="dark:fill-[#12183F]" />
      <rect x="5.5" y="14" width="4.5" height="2.2" rx="0.6" fill="white" className="dark:fill-[#12183F]" />
    </svg>
  );
}

export interface PropertyDetailPageProps {
  property: Property;
  allProperties?: Property[];
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
  onNavigateHome?: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  allProperties = [],
  onBack,
  onSelectProperty,
  onNavigateHome,
}) => {
  // Gallery state
  const images = [
    property.image,
    ...(property.gallery || []),
  ].filter(Boolean) as string[];

  // Fallback if no images
  const finalImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  ];

  const [activeImage, setActiveImage] = useState<string>(finalImages[0]);

  // When property changes, reset active image
  useEffect(() => {
    setActiveImage(finalImages[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [property.id]);

  // Booking Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    setFormSubmitted(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Related properties (same property type or same country, excluding current)
  const relatedProperties = allProperties
    .filter((p) => p.id !== property.id)
    .slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="w-full bg-white dark:bg-[#111638] border-b border-[#E2E6EF] dark:border-[#1E2554] sticky top-16 z-30 transition-colors">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#151A46] dark:text-white bg-[#F0F3F9] dark:bg-white/5 hover:bg-[#FF7817] hover:text-white dark:hover:bg-[#FF7817] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Property Listings</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#8A90A2]">
              <span>/</span>
              <span>{property.location || 'Real Estate'}</span>
              <span>/</span>
              <span className="text-[#151A46] dark:text-white font-semibold truncate max-w-xs">
                {property.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5F667A] dark:text-[#AAB2CA] hover:bg-[#F0F3F9] dark:hover:bg-white/5 transition-colors cursor-pointer border border-[#E2E6EF] dark:border-white/10"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 lg:py-10 space-y-10">
        {/* Title & Quick Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E2E6EF] dark:border-[#1E2554]">
          <div className="space-y-3">
            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5D657E] dark:text-[#A0ABC6]">
              <span className="font-bold text-[#FF7817]">{property.property_type || 'Residential'}</span>
              <span aria-hidden="true">·</span>
              <span>For {property.buy_rent || 'Sale'}</span>
              <span aria-hidden="true">·</span>
              <span>Ref ID: AW-{property.id.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FF7817] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Title Deed Verified
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151A46] dark:text-white tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-[#555E78] dark:text-[#BAC3DC]">
              <MapPin className="w-4 h-4 text-[#FF7817] shrink-0" />
              <span>{property.location || property.address || 'Prime Urban District'}</span>
            </div>
          </div>

          <div className="text-left lg:text-right shrink-0 bg-white dark:bg-[#12183F] p-5 rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A90A2] block">
              Offering Price ({property.buy_rent === 'Rent' ? 'Per Month' : 'Total Investment'})
            </span>
            <div className="font-heading text-3xl sm:text-4xl font-black text-[#151A46] dark:text-white mt-0.5">
              ${property.price ? property.price.toLocaleString() : 'Price on Inquiry'}
            </div>
            <span className="text-xs text-[#FF7817] font-semibold flex items-center lg:justify-end gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#FF7817] animate-pulse" />
              Direct Developer / Owner Mandate
            </span>
          </div>
        </div>

        {/* Expansive Visual Gallery */}
        <div className="space-y-4">
          <div className="relative w-full h-[380px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden bg-slate-900 border border-[#DFE4EE] dark:border-[#1E2554] shadow-md group">
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />

            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#151A46]/90 text-white backdrop-blur-md">
                {property.property_type}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FF7817] text-white">
                For {property.buy_rent || 'Sale'}
              </span>
            </div>

            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl">
                <Compass className="w-3.5 h-3.5 text-[#FF7817]" />
                <span>Prime Architectural Build</span>
              </div>
              <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl font-semibold">
                Photo {finalImages.indexOf(activeImage) + 1} of {finalImages.length}
              </span>
            </div>
          </div>

          {/* Thumbnail Carousel */}
          {finalImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {finalImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 sm:h-24 w-32 sm:w-36 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-[#FF7817] scale-102 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumbnail-${idx}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column (70%): Details, Amenities, Specs, Description */}
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Specs Highlight Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white dark:bg-[#12183F] border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A90A2] flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#FF7817]" /> Bedrooms
                </span>
                <p className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
                  {property.bedrooms !== undefined ? `${property.bedrooms} Rooms` : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A90A2] flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-[#FF7817]" /> Bathrooms
                </span>
                <p className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
                  {property.bathrooms !== undefined ? `${property.bathrooms} Baths` : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A90A2] flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#FF7817]" /> Total Area
                </span>
                <p className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
                  {property.area_sqft
                    ? `${property.area_sqft.toLocaleString()} sqft`
                    : property.sqm
                    ? `${property.sqm} sqm`
                    : 'Contact'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A90A2] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#FF7817]" /> Property Type
                </span>
                <p className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
                  {property.property_type}
                </p>
              </div>
            </div>

            {/* In-depth Overview */}
            <div className="bg-white dark:bg-[#12183F] p-8 rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                Property Overview & Strategic Context
              </h2>
              <p className="text-sm sm:text-base text-[#485068] dark:text-[#BAC3DC] leading-relaxed whitespace-pre-line font-normal">
                {property.description}
              </p>
              <div className="pt-4 border-t border-[#EEF2F8] dark:border-[#1E2554] text-xs text-[#6F7792] dark:text-[#A0ABC6]">
                This asset has undergone due diligence review by AW Ali Company’s legal advisory desk,
                verifying ownership title records and compliance with regional municipal building
                ordinances.
              </div>
            </div>

            {/* Key Features & Facilities */}
            <div className="bg-white dark:bg-[#12183F] p-8 rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                Property Features & Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  '24/7 Gated Perimeter Security & Guardhouse',
                  'Dedicated High-Capacity Generator & Solar Backup',
                  'High-Speed Fiber Optic Internet Provisions',
                  'Underground / Shaded Private Parking Stalls',
                  'Reinforced Water Storage & Filtration System',
                  'Balcony / Panoramic Terrace with Scenic Vistas',
                  'Prime Access to Arterial Highways & Airports',
                  'Commercial Shopping & Dining Districts in Vicinity',
                ].map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8FAFD] dark:bg-white/[0.02] border border-[#E5EAF3] dark:border-white/5 text-xs font-semibold text-[#151A46] dark:text-white"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Quick Indicators Bar - Amenities */}
            <div className="bg-white dark:bg-[#12183F] p-6 sm:p-8 rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs space-y-5">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#151A46] dark:text-white pb-3 border-b border-[#EDF1F7] dark:border-[#1E2554]">
                Amenities
              </h2>
              <div className="flex flex-wrap items-center justify-between sm:justify-around gap-6 sm:gap-10 text-[#1F244A] dark:text-[#E2E8F0] pt-1">
                {/* 1. Road Access */}
                <div className="flex items-center gap-2.5">
                  <RoadIcon className="w-[22px] h-[22px] text-[#1F244A] dark:text-[#E2E8F0] shrink-0" />
                  <span className="text-base sm:text-[17px] font-medium tracking-tight">
                    {property.street?.toLowerCase().includes('no') ? 'No' : 'Yes'}
                  </span>
                </div>

                {/* 2. Shopping / Commercial */}
                <div className="flex items-center gap-2.5">
                  <CartIcon className="w-[22px] h-[22px] text-[#1F244A] dark:text-[#E2E8F0] shrink-0" />
                  <span className="text-base sm:text-[17px] font-medium tracking-tight">
                    {property.shopping?.toLowerCase().includes('mall')
                      ? 'Near mall'
                      : (property.shopping ? property.shopping : 'Near mall')}
                  </span>
                </div>

                {/* 3. Furnished Status */}
                <div className="flex items-center gap-2.5">
                  <SofaIcon className="w-[22px] h-[22px] text-[#1F244A] dark:text-[#E2E8F0] shrink-0" />
                  <span className="text-base sm:text-[17px] font-medium tracking-tight">
                    {property.furnishing_status === 'Furnished' ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* 4. Masjid */}
                <div className="flex items-center gap-2.5">
                  <MosqueIcon className="w-[22px] h-[22px] text-[#1F244A] dark:text-[#E2E8F0] shrink-0" />
                  <span className="text-base sm:text-[17px] font-medium tracking-tight">
                    {property.masjid || 'Near'}
                  </span>
                </div>

                {/* 5. Payment Terms */}
                <div className="flex items-center gap-2.5">
                  <CardIcon className="w-[22px] h-[22px] text-[#1F244A] dark:text-[#E2E8F0] shrink-0" />
                  <span className="text-base sm:text-[17px] font-medium tracking-tight">
                    {property.payment?.toLowerCase().includes('cash')
                      ? 'Cash'
                      : (property.payment || 'Cash')}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Property Specifications Table */}
            <div className="bg-white dark:bg-[#12183F] p-8 rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-xs space-y-5">
              <h2 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                Detailed Property Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-8 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Property Reference:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">AW-{property.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Transaction Category:</span>
                  <span className="font-bold text-[#FF7817]">For {property.buy_rent || 'Sale'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Classification / Category:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.property_type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Furnishing Status:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.furnishing_status || 'Furnished'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Street (Direct Access):</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.street || 'Yes (Paved Road / Main Boulevard)'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Masjid Proximity:</span>
                  <span className="font-bold text-[#FF7817]">{property.masjid || 'Near'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Nearby Shopping & Commercial:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.shopping || 'Emporium Mall (5 min walk)'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Payment Terms:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.payment || 'Cash / 4 Quarters / Installments'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Balcony / Terrace:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">{property.balcony || 'Yes'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Total Floor Area:</span>
                  <span className="font-bold text-[#151A46] dark:text-white">
                    {property.sqm ? `${property.sqm} SQM` : ''}{' '}
                    {property.area_sqft ? `(${property.area_sqft.toLocaleString()} sqft)` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Title Verification:</span>
                  <span className="font-bold text-[#FF7817]">Official Title Deed Verified</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EDF1F7] dark:border-white/5">
                  <span className="text-[#8A90A2]">Listing Status:</span>
                  <span className="font-bold text-[#FF7817]">{property.status === 'Active' ? 'Active Listing' : property.status}</span>
                </div>
              </div>
            </div>

            {/* Related Properties */}
            {relatedProperties.length > 0 && onSelectProperty && (
              <div className="space-y-6 pt-4">
                <h3 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                  Other Featured Assets You May Consider
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedProperties.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectProperty(rel)}
                      className="group bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="h-40 w-full overflow-hidden bg-slate-900">
                        <img
                          src={rel.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white group-hover:text-[#FF7817] transition-colors truncate">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-[#6F7792] dark:text-[#A0ABC6] truncate">
                          {rel.location}
                        </p>
                        <p className="font-heading text-base font-black text-[#FF7817]">
                          ${rel.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sticky 30%): Broker Desk & Tour Booking */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* Direct Booking Card */}
              <div className="bg-white dark:bg-[#12183F] p-7 rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] shadow-lg space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF7817] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Private Viewing Desk</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                    Schedule an Inspection
                  </h3>
                  <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA] mt-1 font-normal">
                    Arrange a private on site inspection or remote video tour with an AW Ali senior
                    property broker.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-[#FF7817]/10 dark:bg-[#FF7817]/15 border border-[#FF7817]/30 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF7817]/20 text-[#FF7817] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                      Viewing Request Confirmed!
                    </h4>
                    <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA]">
                      Thank you, <strong>{clientName}</strong>. Our designated broker for{' '}
                      <strong>{property.location}</strong> will contact you via WhatsApp / phone
                      within 2 business hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs font-bold text-[#FF7817] hover:underline pt-2 cursor-pointer"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#2B3352] dark:text-[#D5DCF0]">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Abdirahman Ali"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#2B3352] dark:text-[#D5DCF0]">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+252 61 ... or +90 532 ..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#2B3352] dark:text-[#D5DCF0]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#2B3352] dark:text-[#D5DCF0]">
                        Preferred Tour Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#2B3352] dark:text-[#D5DCF0]">
                        Notes / Financing Inquiries
                      </label>
                      <textarea
                        rows={2}
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Inquire about title deed, payment milestones, or immediate occupancy..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9DFEC] dark:border-[#222B5D] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Private Viewing</span>
                    </button>
                  </form>
                )}

                {/* Instant Broker Direct Contact */}
                <div className="pt-4 border-t border-[#EEF2F8] dark:border-[#1E2554] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#151A46] text-white flex items-center justify-center font-bold text-sm">
                      AW
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#151A46] dark:text-white">
                        AW Ali Real Estate Desk
                      </p>
                      <p className="text-[11px] text-[#8A90A2]">
                        Licensed Property Advisory
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/252613295050"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Direct WhatsApp Inquiry</span>
                  </a>

                  <div className="text-center">
                    <span className="text-[11px] text-[#8A90A2]">
                      Emergency Broker Line: <strong>+252 61 329 5050</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

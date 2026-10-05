import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Edit2,
  Trash2,
  Maximize2,
  Bed,
  Bath,
  Wind,
  Compass,
  ShoppingBag,
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Property } from '../../types';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!property) return null;

  // Build photo array combining featured image + gallery images
  const allPhotos: string[] = [];
  if (property.image) allPhotos.push(property.image);
  if (property.gallery && property.gallery.length > 0) {
    property.gallery.forEach((url) => {
      if (url && !allPhotos.includes(url)) allPhotos.push(url);
    });
  }

  const formatCurrency = (val: number) => `Rs ${val.toLocaleString('en-PK')}`;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentDisplayPhoto = allPhotos[activePhotoIndex] || property.image;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Details & Specification" maxWidth="3xl">
      <div className="space-y-6">
        {/* Photo Gallery Viewer */}
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] group">
            <img
              src={currentDisplayPhoto}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300"
            />
            {/* Overlay Tags */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#151A46]/90 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider">
                {property.buy_rent || 'Sale'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FF7817] text-white text-xs font-semibold">
                {property.property_type}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <Badge
                variant={
                  property.status === 'Active'
                    ? 'active'
                    : property.status === 'Pending'
                    ? 'pending'
                    : 'sold'
                }
              >
                {property.status}
              </Badge>
            </div>

            <div className="absolute bottom-3 left-3 bg-[#0B1030]/85 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-lg text-base font-bold shadow-md">
              {formatCurrency(property.price)}
            </div>

            {/* Slider arrows if multiple photos */}
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {allPhotos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-[#FF7817] ring-2 ring-[#FF7817]/30 scale-105'
                      : 'border-[#D9DDE8] dark:border-[#252B5C] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title & Location Header */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[#151A46] dark:text-white">
            {property.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#5F667A] dark:text-[#8A90A2] mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FF7817]" />
            <span>{property.address || property.location}</span>
          </div>
        </div>

        {/* Key Quick Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] text-center">
          <div>
            <p className="text-[10px] text-[#8A90A2] uppercase font-bold tracking-wider">Bedrooms</p>
            <p className="font-bold text-sm text-[#171A2B] dark:text-white mt-0.5">
              {property.bedrooms !== undefined ? `${property.bedrooms} Beds` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#8A90A2] uppercase font-bold tracking-wider">Bathrooms</p>
            <p className="font-bold text-sm text-[#171A2B] dark:text-white mt-0.5">
              {property.bathrooms !== undefined ? `${property.bathrooms} Baths` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#8A90A2] uppercase font-bold tracking-wider">Property Size</p>
            <p className="font-bold text-sm text-[#171A2B] dark:text-white mt-0.5">
              {property.sqm ? `${property.sqm} SQM` : property.area_sqft ? `${property.area_sqft} sqft` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#8A90A2] uppercase font-bold tracking-wider">Balcony</p>
            <p className="font-bold text-sm text-[#171A2B] dark:text-white mt-0.5">
              {property.balcony || 'No'}
            </p>
          </div>
        </div>

        {/* Complete System Specification Grid (All screenshot fields) */}
        <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] p-4 bg-white dark:bg-[#151A46] space-y-3">
          <h4 className="text-xs font-bold text-[#151A46] dark:text-white uppercase tracking-wider border-b border-[#D9DDE8] dark:border-[#252B5C] pb-2">
            Property Specifications & Neighborhood
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#252B5C]/50">
              <span className="text-[#8A90A2]">Furnishing Status:</span>
              <span className="font-semibold text-[#171A2B] dark:text-white">
                {property.furnishing_status || 'Unfurnished'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#252B5C]/50">
              <span className="text-[#8A90A2]">Street (Direct Access):</span>
              <span className="font-semibold text-[#171A2B] dark:text-white">
                {property.street || 'Yes'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#252B5C]/50">
              <span className="text-[#8A90A2]">Masjid Proximity:</span>
              <span className="font-semibold text-[#171A2B] dark:text-white">
                {property.masjid || 'Near'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#252B5C]/50">
              <span className="text-[#8A90A2]">Buy / Rent Option:</span>
              <span className="font-semibold text-[#FF7817]">
                {property.buy_rent || 'Sale'}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-100 dark:border-[#252B5C]/50 gap-1">
              <span className="text-[#8A90A2] shrink-0">Shopping / Commercial:</span>
              <span className="font-semibold text-[#171A2B] dark:text-white text-right">
                {property.shopping || 'Nearby commercial markets'}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:justify-between py-1 gap-1">
              <span className="text-[#8A90A2] shrink-0">Payment Schedule / Terms:</span>
              <span className="font-semibold text-[#171A2B] dark:text-white text-right">
                {property.payment || 'Standard payment terms'}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h4 className="text-xs font-bold text-[#151A46] dark:text-white uppercase tracking-wider mb-2">
            Description
          </h4>
          <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] text-xs text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed whitespace-pre-line">
            {property.description || 'No detailed description provided for this listing.'}
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="pt-3 border-t border-[#D9DDE8] dark:border-[#252B5C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8A90A2]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FF7817]" />
            <span>Listed on {formatDate(property.created_at)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(property);
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(property);
              }}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit Property
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

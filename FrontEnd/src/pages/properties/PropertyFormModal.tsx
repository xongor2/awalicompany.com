import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  DollarSign,
  Maximize2,
  Bed,
  Bath,
  Wind,
  MapPin,
  Compass,
  Home,
  CreditCard,
  Layers,
  Sparkles,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Eye,
  Code,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Property } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { CityAutocomplete } from './CityAutocomplete';

interface PropertyFormPageProps {
  onClose: () => void;
  onSuccess: () => void;
  propertyToEdit?: Property | null;
}

const SAMPLE_FEATURED_PRESETS = [
  { label: 'Modern House', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Luxury Penthouse', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Executive Villa', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Commercial Plaza', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Lakeview Residence', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80' }
];

const SAMPLE_GALLERY_PRESETS = [
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80',
];

interface FormErrors {
  title?: string;
  address?: string;
  city?: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqm?: string;
  image?: string;
}

export const PropertyFormPage: React.FC<PropertyFormPageProps> = ({
  onClose,
  onSuccess,
  propertyToEdit,
}) => {
  const { showToast } = useToast();
  const isEdit = Boolean(propertyToEdit);

  // Field states matching screenshots & spec:
  // 1. Property Title
  const [title, setTitle] = useState('');
  // 2. address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  // 3. Price
  const [price, setPrice] = useState('');
  // 4. Buy / Rent: Sale or Rent
  const [buyRent, setBuyRent] = useState<'Sale' | 'Rent'>('Sale');
  // 5. Bedrooms
  const [bedrooms, setBedrooms] = useState('');
  // 6. Bathrooms
  const [bathrooms, setBathrooms] = useState('');
  // 7. Balcony: Yes or No
  const [balcony, setBalcony] = useState<'Yes' | 'No'>('No');
  // 8. SQM / Property Size
  const [sqm, setSqm] = useState('');
  // 9. Description (with visual rich editor simulation)
  const [description, setDescription] = useState('');
  const [descViewMode, setDescViewMode] = useState<'visual' | 'code'>('visual');
  // 10. Street (select / options)
  const [street, setStreet] = useState<'Yes' | 'No'>('Yes');
  // 11. Furnishing Status
  const [furnishingStatus, setFurnishingStatus] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Furnished');
  // 12. Shopping / Nearby Shopping
  const [shopping, setShopping] = useState('');
  // 13. Masjid: Near or Far
  const [masjid, setMasjid] = useState<'Near' | 'Far'>('Near');
  // 14. Payment
  const [payment, setPayment] = useState('');
  // 15. Property Type & Status (supporting dashboard categories)
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Apartment' | 'Villa' | 'Plot'>('Residential');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Sold'>('Active');

  // 16. Featured Image (Single main property image)
  const [featuredImage, setFeaturedImage] = useState('');
  // 17. Gallery (Multiple property images)
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // File input refs
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Full form wipe / reset helper
  const resetForm = () => {
    setTitle('');
    setAddress('');
    setCity('');
    setPrice('');
    setBuyRent('Sale');
    setBedrooms('');
    setBathrooms('');
    setBalcony('No');
    setSqm('');
    setDescription('');
    setStreet('Yes');
    setFurnishingStatus('Furnished');
    setShopping('');
    setMasjid('Near');
    setPayment('');
    setPropertyType('Residential');
    setStatus('Active');
    setFeaturedImage('');
    setGalleryImages([]);
    setErrors({});
    setGeneralError(null);
    setDescViewMode('visual');
    if (featuredInputRef.current) featuredInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Populate or reset the dedicated page when the selected property changes.
  useEffect(() => {
      if (propertyToEdit) {
        setTitle(propertyToEdit.title || '');
        setAddress(propertyToEdit.address || propertyToEdit.location || '');
        setCity(propertyToEdit.location || '');
        setPrice(propertyToEdit.price !== undefined ? String(propertyToEdit.price) : '');
        setBuyRent(propertyToEdit.buy_rent || 'Sale');
        setBedrooms(propertyToEdit.bedrooms !== undefined ? String(propertyToEdit.bedrooms) : '');
        setBathrooms(propertyToEdit.bathrooms !== undefined ? String(propertyToEdit.bathrooms) : '');
        setBalcony(propertyToEdit.balcony || 'No');
        setSqm(propertyToEdit.sqm !== undefined ? String(propertyToEdit.sqm) : (propertyToEdit.area_sqft ? String(Math.round(propertyToEdit.area_sqft / 10.764)) : ''));
        setDescription(propertyToEdit.description || '');
        setStreet((propertyToEdit.street as any) || 'Yes');
        setFurnishingStatus(propertyToEdit.furnishing_status || 'Furnished');
        setShopping(propertyToEdit.shopping || '');
        setMasjid(propertyToEdit.masjid || 'Near');
        setPayment(propertyToEdit.payment || '');
        setPropertyType(propertyToEdit.property_type || 'Residential');
        setStatus(propertyToEdit.status || 'Active');
        setFeaturedImage(propertyToEdit.image || '');
        setGalleryImages(propertyToEdit.gallery && propertyToEdit.gallery.length > 0 ? [...propertyToEdit.gallery] : []);
        setErrors({});
        setGeneralError(null);
        setDescViewMode('visual');
      } else {
        resetForm();
      }
  }, [propertyToEdit]);

  // Handle Featured Image Upload (File -> Data URL)
  const handleFeaturedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFeaturedImage(reader.result);
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: undefined }));
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Multiple Gallery Images Upload
  const handleGalleryFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newImages.push(reader.result);
        }
        processed++;
        if (processed === files.length) {
          setGalleryImages((prev) => [...prev, ...newImages]);
          showToast(`Added ${newImages.length} photo(s) to gallery.`, 'info');
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Remove gallery photo
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Quick insertion helpers for Rich Text Editor
  const handleFormatText = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDescription((prev) => `${prev}\n${prefix}Text${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end) || 'Text';
    const updated = description.substring(0, start) + prefix + selected + suffix + description.substring(end);
    setDescription(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Property Title is required.';
    } else if (title.trim().length < 4) {
      newErrors.title = 'Title must be at least 4 characters.';
    }

    if (!address.trim()) {
      newErrors.address = 'Street address / location is required.';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required.';
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid numeric price greater than 0.';
    }

    if (bedrooms && (isNaN(Number(bedrooms)) || Number(bedrooms) < 0)) {
      newErrors.bedrooms = 'Bedrooms must be 0 or a positive number.';
    }

    if (bathrooms && (isNaN(Number(bathrooms)) || Number(bathrooms) < 0)) {
      newErrors.bathrooms = 'Bathrooms must be 0 or a positive number.';
    }

    if (sqm && (isNaN(Number(sqm)) || Number(sqm) <= 0)) {
      newErrors.sqm = 'SQM must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Safe close handler that empties state
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      setGeneralError('Please check the form for errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const numPrice = Number(price);
      const numSqm = sqm ? Number(sqm) : undefined;
      const numAreaSqft = numSqm ? Math.round(numSqm * 10.764) : undefined;

      const defaultFallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80';
      const resolvedImage = featuredImage.trim() || (galleryImages.length > 0 ? galleryImages[0] : defaultFallbackImage);

      const payload: Partial<Property> = {
        title: title.trim(),
        address: address.trim(),
        location: city.trim(),
        price: numPrice,
        buy_rent: buyRent,
        bedrooms: bedrooms !== '' ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== '' ? Number(bathrooms) : undefined,
        balcony,
        sqm: numSqm,
        area_sqft: numAreaSqft,
        description: description.trim(),
        street,
        furnishing_status: furnishingStatus,
        shopping: shopping.trim(),
        masjid,
        payment: payment.trim(),
        property_type: propertyType,
        status,
        image: resolvedImage,
        gallery: galleryImages.filter((img) => Boolean(img.trim())),
      };

      if (isEdit && propertyToEdit) {
        await api.updateProperty(propertyToEdit.id, payload);
        showToast('Property listing updated successfully.', 'success');
      } else {
        await api.createProperty(payload);
        showToast('New property created successfully.', 'success');
      }

      // Empty the form completely after publishing
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while saving the property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9DDE8] bg-white text-[#5F667A] transition-colors hover:border-[#FF7817] hover:text-[#FF7817] dark:border-[#252B5C] dark:bg-[#151A46] dark:text-[#D9DDE8]"
            aria-label="Back to properties"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E4] text-[#FF7817] dark:bg-[#252B5C]">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
              {isEdit ? 'Edit Property Listing' : 'Add New Property'}
            </h1>
            <p className="text-sm font-normal text-[#8A90A2]">
              AW Ali Company Real Estate Property System
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={handleClose} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Properties
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#D9DDE8] bg-white p-4 shadow-sm sm:p-6 dark:border-[#252B5C] dark:bg-[#0E1335]">
        {/* Banner Alert for Errors */}
        {generalError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">{generalError}</p>
              <p className="text-[11px] opacity-80 mt-0.5">Please review the highlighted fields below.</p>
            </div>
          </div>
        )}

        {/* 1. Main Title Input Header */}
        <div className="bg-[#F8F9FC] dark:bg-[#0B1030]/60 p-4 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C]">
          <label className="block text-xs font-bold text-[#151A46] dark:text-[#D9DDE8] uppercase tracking-wider mb-1.5">
            Property Title <span className="text-[#FF7817]">*</span>
          </label>
          <input
            id="property-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Modern Luxury Family Villa with Garden"
            className={`w-full h-12 px-4 rounded-lg border text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7817] bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-white placeholder-[#8A90A2] ${
              errors.title
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-[#D9DDE8] dark:border-[#252B5C]'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
          <p className="text-[11px] text-[#8A90A2] mt-1">
            Display name shown in search listings, hero card, and customer quotations.
          </p>
        </div>

        {/* Layout Grid: Main Settings (Left) & Media Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Property Specification Settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Box 1: Core Specs Card */}
            <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF7817]" />
                  <h3 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Settings & Key Attributes
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-[#8A90A2]">
                  System Fields
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Row 1: address, city, Price, Buy/Rent */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Address */}
                  <div className="md:col-span-4">
                    <Input
                      id="property-address-input"
                      label="Address *"
                      required
                      value={address}
                      error={errors.address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      placeholder="e.g. Sector J, DHA Phase 6, Lahore"
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  {/* Searchable City Category */}
                  <div className="md:col-span-3">
                    <CityAutocomplete
                      value={city}
                      enabled
                      error={errors.city}
                      onChange={nextCity => {
                        setCity(nextCity);
                        if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
                      }}
                    />
                  </div>

                  {/* Price */}
                  <div className="md:col-span-3">
                    <Input
                      id="property-price-input"
                      label="Price (PKR) *"
                      type="number"
                      required
                      min="1"
                      value={price}
                      error={errors.price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      placeholder="e.g. 25000000"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>

                  {/* Buy / Rent Radio Buttons */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-2">
                      Buy / Rent *
                    </label>
                    <div className="flex flex-col gap-2 pt-0.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="buy_rent"
                          value="Sale"
                          checked={buyRent === 'Sale'}
                          onChange={() => setBuyRent('Sale')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>Sale</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="buy_rent"
                          value="Rent"
                          checked={buyRent === 'Rent'}
                          onChange={() => setBuyRent('Rent')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>Rent</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 2: Bedrooms & Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#D9DDE8]/60 dark:border-[#252B5C]/60">
                  <div>
                    <Input
                      id="property-bedrooms-input"
                      label="Bedrooms"
                      type="number"
                      min="0"
                      value={bedrooms}
                      error={errors.bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      placeholder="e.g. 4"
                      leftIcon={<Bed className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <Input
                      id="property-bathrooms-input"
                      label="Bathrooms"
                      type="number"
                      min="0"
                      value={bathrooms}
                      error={errors.bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      placeholder="e.g. 4"
                      leftIcon={<Bath className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Row 3: Balcony & SQM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#D9DDE8]/60 dark:border-[#252B5C]/60 items-center">
                  <div>
                    <label className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-2">
                      Balcony
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="balcony"
                          value="Yes"
                          checked={balcony === 'Yes'}
                          onChange={() => setBalcony('Yes')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="balcony"
                          value="No"
                          checked={balcony === 'No'}
                          onChange={() => setBalcony('No')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Input
                      id="property-sqm-input"
                      label="SQM (Property Size)"
                      type="number"
                      min="1"
                      value={sqm}
                      error={errors.sqm}
                      onChange={(e) => setSqm(e.target.value)}
                      placeholder="e.g. 350"
                      leftIcon={<Maximize2 className="w-4 h-4" />}
                      helperText={sqm && !isNaN(Number(sqm)) ? `Approx. ${Math.round(Number(sqm) * 10.764).toLocaleString()} Sq Ft` : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Rich Description Editor */}
            <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#D9DDE8] dark:border-[#252B5C] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Description
                  </h3>
                  <span className="text-[11px] text-[#8A90A2]">(_description)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mode switcher: Visual vs Code */}
                  <div className="inline-flex rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] p-0.5 bg-white dark:bg-[#151A46]">
                    <button
                      type="button"
                      onClick={() => setDescViewMode('visual')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        descViewMode === 'visual'
                          ? 'bg-[#151A46] text-white dark:bg-[#FF7817]'
                          : 'text-[#5F667A] dark:text-[#D9DDE8] hover:text-[#171A2B]'
                      }`}
                    >
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescViewMode('code')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        descViewMode === 'code'
                          ? 'bg-[#151A46] text-white dark:bg-[#FF7817]'
                          : 'text-[#5F667A] dark:text-[#D9DDE8] hover:text-[#171A2B]'
                      }`}
                    >
                      Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-2 bg-[#F8F9FC] dark:bg-[#0B1030]/40 border-b border-[#D9DDE8] dark:border-[#252B5C] flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFormatText('**', '**')}
                  title="Bold"
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8] transition-colors"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('*', '*')}
                  title="Italic"
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8] transition-colors"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('\n- ')}
                  title="Bullet List"
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8] transition-colors"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('\n1. ')}
                  title="Numbered List"
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8] transition-colors"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatText('\n> ')}
                  title="Quote"
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8] transition-colors"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-[#252B5C] mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    setDescription(
                      (prev) =>
                        prev +
                        '\n\n### Highlights:\n- Double glazed thermal windows\n- Solid ash-wood internal doors\n- Rooftop solar inverter installed\n- 24/7 Gated security patrol'
                    );
                  }}
                  className="text-[11px] font-semibold text-[#FF7817] hover:underline px-2 py-1"
                >
                  + Add Amenities Template
                </button>
              </div>

              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  id="property-description-textarea"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an extensive architectural description, amenities, nearby road networks, floor finish specifications, and property highlights..."
                  className={`w-full p-3.5 rounded-lg border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF7817] bg-white dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] ${
                    descViewMode === 'code' ? 'font-mono' : 'font-sans'
                  } border-[#D9DDE8] dark:border-[#252B5C]`}
                />
              </div>
            </div>

            {/* Box 3: Amenities */}
            <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#FF7817]" />
                  <h3 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Amenities
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Street & Furnishing Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      id="property-street-select"
                      label="Street (Direct Access)"
                      value={street}
                      onChange={(e) => setStreet(e.target.value as any)}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                    />
                  </div>

                  <div>
                    <Select
                      id="property-furnishing-select"
                      label="Furnishing Status"
                      value={furnishingStatus}
                      onChange={(e) => setFurnishingStatus(e.target.value as any)}
                      options={[
                        { value: 'Furnished', label: 'Furnished' },
                        { value: 'Semi-Furnished', label: 'Semi-Furnished' },
                        { value: 'Unfurnished', label: 'Unfurnished' },
                      ]}
                    />
                  </div>
                </div>

                {/* Shopping, Masjid, Payment */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-[#D9DDE8]/60 dark:border-[#252B5C]/60 items-center">
                  {/* Shopping */}
                  <div className="md:col-span-5">
                    <Input
                      id="property-shopping-input"
                      label="Shopping / Nearby Commercial"
                      value={shopping}
                      onChange={(e) => setShopping(e.target.value)}
                      placeholder="e.g. Emporium Mall (5 mins), local market"
                    />
                  </div>

                  {/* Masjid: Near or Far */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-2">
                      Masjid
                    </label>
                    <div className="flex items-center gap-5">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="masjid"
                          value="Near"
                          checked={masjid === 'Near'}
                          onChange={() => setMasjid('Near')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>Near</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#171A2B] dark:text-white">
                        <input
                          type="radio"
                          name="masjid"
                          value="Far"
                          checked={masjid === 'Far'}
                          onChange={() => setMasjid('Far')}
                          className="w-4 h-4 text-[#FF7817] focus:ring-[#FF7817] accent-[#FF7817] cursor-pointer"
                        />
                        <span>Far</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="md:col-span-4">
                    <Input
                      id="property-payment-input"
                      label="Payment Terms"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      placeholder="e.g. Cash / 4 Quarterly Installments"
                    />
                  </div>
                </div>

                {/* Property Type & Status classification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D9DDE8]/60 dark:border-[#252B5C]/60">
                  <div>
                    <Select
                      id="property-type-select"
                      label="Classification / Category"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as any)}
                      options={[
                        { value: 'Residential', label: 'Residential' },
                        { value: 'Apartment', label: 'Apartment' },
                        { value: 'Commercial', label: 'Commercial' },
                        { value: 'Villa', label: 'Villa' },
                        { value: 'Plot', label: 'Plot' },
                      ]}
                    />
                  </div>

                  <div>
                    <Select
                      id="property-status-select"
                      label="Listing Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      options={[
                        { value: 'Active', label: 'Active Listing' },
                        { value: 'Pending', label: 'Pending Review' },
                        { value: 'Sold', label: 'Sold / Leased' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media, Featured Image & Gallery */}
          <div className="lg:col-span-4 space-y-6">
            {/* Box 4: Featured Image (Single main property image) */}
            <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FF7817]" />
                  <h3 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Featured Image
                  </h3>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#FFF0E4] dark:bg-[#252B5C] text-[#FF7817]">
                  Main
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* Hidden File Input */}
                <input
                  ref={featuredInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedFileUpload}
                  className="hidden"
                />

                {/* Preview or Empty Upload Dropzone */}
                {featuredImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-[#D9DDE8] dark:border-[#252B5C] aspect-video group bg-gray-100 dark:bg-[#0B1030]">
                    <img
                      src={featuredImage}
                      alt="Featured property preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => featuredInputRef.current?.click()}
                        className="p-2 rounded-lg bg-white/90 text-[#171A2B] hover:bg-white text-xs font-semibold cursor-pointer shadow-sm transition-transform active:scale-95"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 text-xs font-semibold cursor-pointer shadow-sm transition-transform active:scale-95"
                        title="Remove featured image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => featuredInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      errors.image
                        ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-[#D9DDE8] dark:border-[#252B5C] hover:border-[#FF7817] hover:bg-[#FFF0E4]/30 dark:hover:bg-[#252B5C]/30'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817] mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#151A46] dark:text-white">
                      Set Featured Image
                    </p>
                    <p className="text-[11px] text-[#8A90A2] mt-0.5">
                      Click to browse or drag file here
                    </p>
                  </div>
                )}

                {errors.image && (
                  <p className="text-xs text-rose-500 font-medium">{errors.image}</p>
                )}

                {/* URL input field as fallback / direct entry */}
                <div className="pt-2">
                  <Input
                    label="Image URL (Direct link)"
                    value={featuredImage}
                    onChange={(e) => {
                      setFeaturedImage(e.target.value);
                      if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Presets */}
                <div>
                  <p className="text-[11px] font-semibold text-[#8A90A2] mb-1.5">
                    Quick Sample Presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_FEATURED_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setFeaturedImage(p.url);
                          if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
                        }}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                          featuredImage === p.url
                            ? 'bg-[#FF7817] text-white border-[#FF7817] font-semibold'
                            : 'bg-white dark:bg-[#151A46] text-[#5F667A] dark:text-[#D9DDE8] border-[#D9DDE8] dark:border-[#252B5C] hover:bg-gray-100 dark:hover:bg-[#252B5C]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 5: Gallery (Multiple property images) */}
            <div className="rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#FF7817]" />
                  <h3 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Gallery
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#FF7817]">
                  {galleryImages.length} photo{galleryImages.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryFilesUpload}
                  className="hidden"
                />

                {/* Upload action button */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => galleryInputRef.current?.click()}
                    leftIcon={<Upload className="w-3.5 h-3.5 text-[#FF7817]" />}
                  >
                    Choose Media / Add Photos
                  </Button>
                </div>

                {/* Gallery Images Grid Preview */}
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {galleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden aspect-square border border-[#D9DDE8] dark:border-[#252B5C] group bg-gray-100 dark:bg-[#0B1030]"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#F8F9FC] dark:bg-[#0B1030] text-center border border-dashed border-[#D9DDE8] dark:border-[#252B5C]">
                    <p className="text-xs text-[#8A90A2]">
                      No gallery photos uploaded yet. Click Choose Media to add interior and exterior shots.
                    </p>
                  </div>
                )}

                {/* Quick Add Presets to Gallery */}
                <div className="pt-2 border-t border-[#D9DDE8] dark:border-[#252B5C]">
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryImages((prev) => Array.from(new Set([...prev, ...SAMPLE_GALLERY_PRESETS])));
                      showToast('Added showcase gallery photos.', 'info');
                    }}
                    className="text-[11px] font-semibold text-[#FF7817] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Gallery Pack (5 photos)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions: Cancel & Save Property */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#D9DDE8] dark:border-[#252B5C]">
          <div className="text-xs text-[#8A90A2] hidden sm:block">
            Fields marked with <span className="text-[#FF7817] font-bold">*</span> are required.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={isSubmitting}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#8A90A2]" />}
              title="Clear all fields in this form"
            >
              Clear Form
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isEdit ? 'Save Property' : 'Publish Property'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

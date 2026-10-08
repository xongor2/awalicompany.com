import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, HeartPulse, Image as ImageIcon, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { HealthSpecialty, HealthSpecialtyStatus } from '../../types';

type FormErrors = Partial<Record<'category' | 'name' | 'country' | 'city' | 'description' | 'keyProcedures' | 'destinations' | 'image', string>>;

const linesToList = (value: string): string[] => [...new Set(
  value.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean),
)];

export const HealthPage: React.FC = () => {
  const [items, setItems] = useState<HealthSpecialty[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<HealthSpecialty | null>(null);
  const [deleting, setDeleting] = useState<HealthSpecialty | null>(null);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [keyProcedures, setKeyProcedures] = useState('');
  const [destinations, setDestinations] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<HealthSpecialtyStatus>('Active');
  const [errors, setErrors] = useState<FormErrors>({});
  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await api.getHealthSpecialties());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load health specialties.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.country.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.destinations.some(destination => destination.toLowerCase().includes(term)),
    );
  }, [items, search]);

  const resetForm = () => {
    setCategory(''); setName(''); setCountry(''); setCity(''); setDescription('');
    setKeyProcedures(''); setDestinations(''); setImage(''); setStatus('Active'); setErrors({});
  };

  const openCreateForm = () => { setEditing(null); resetForm(); setIsFormOpen(true); };

  const openEditForm = (item: HealthSpecialty) => {
    setEditing(item); setCategory(item.category); setName(item.name); setCountry(item.country); setCity(item.city);
    setDescription(item.description); setKeyProcedures(item.keyProcedures.join('\n'));
    setDestinations(item.destinations.join('\n')); setImage(item.image); setStatus(item.status);
    setErrors({}); setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditing(null); resetForm(); };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(current => ({ ...current, image: 'Select a valid image file.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(current => ({ ...current, image: 'Image must be smaller than 5 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setErrors(current => ({ ...current, image: undefined }));
      }
    };
    reader.onerror = () => setErrors(current => ({ ...current, image: 'Unable to read this image.' }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const procedures = linesToList(keyProcedures);
    const destinationList = linesToList(destinations);
    if (!category.trim()) nextErrors.category = 'Category is required.';
    if (!name.trim()) nextErrors.name = 'Title is required.';
    if (!country.trim()) nextErrors.country = 'Country is required.';
    if (!city.trim()) nextErrors.city = 'City is required.';
    if (!description.trim()) nextErrors.description = 'Description is required.';
    if (procedures.length === 0) nextErrors.keyProcedures = 'Add at least one clinical focus.';
    if (destinationList.length === 0) nextErrors.destinations = 'Add at least one destination.';
    if (!image) nextErrors.image = 'A card image is required.';
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }

    const payload = {
      category: category.trim(), name: name.trim(), country: country.trim(), city: city.trim(), description: description.trim(),
      keyProcedures: procedures, destinations: destinationList, image, status,
    };
    setIsSaving(true);
    try {
      if (editing) {
        await api.updateHealthSpecialty(editing.id, payload);
        showToast('Health specialty updated successfully.', 'success');
      } else {
        await api.createHealthSpecialty(payload);
        showToast('Health specialty added successfully.', 'success');
      }
      closeForm();
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save health specialty.', 'error');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteHealthSpecialty(deleting.id);
      showToast('Health specialty deleted successfully.', 'success');
      setDeleting(null);
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete health specialty.', 'error');
    } finally { setIsSaving(false); }
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={editing ? 'Edit Health Service' : 'Add Health Service'}
          subtitle="Enter the clinical specialty information that will appear on the public Health page."
          action={<Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Back to Health</Button>}
        />

        <section className="rounded-xl border border-[#D9DDE8] bg-white p-5 shadow-xs sm:p-7 dark:border-[#252B5C] dark:bg-[#151A46]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Category *" value={category} onChange={event => setCategory(event.target.value)} placeholder="e.g. Cardiology & Heart" error={errors.category} autoFocus />
              <Select label="Status *" value={status} onChange={event => setStatus(event.target.value as HealthSpecialtyStatus)} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            </div>
            <Input label="Title *" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Cardiology & Advanced Heart Surgery" error={errors.name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Country *" value={country} onChange={event => setCountry(event.target.value)} placeholder="e.g. Turkey" error={errors.country} />
              <Input label="City *" value={city} onChange={event => setCity(event.target.value)} placeholder="e.g. Istanbul" error={errors.city} />
            </div>
            <Textarea label="Description *" value={description} onChange={event => setDescription(event.target.value)} placeholder="Describe the specialty and treatment program." error={errors.description} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea label="Included Clinical Focus *" value={keyProcedures} onChange={event => setKeyProcedures(event.target.value)} placeholder={'One item per line\nCoronary Artery Bypass\nHeart Valve Replacement'} helperText="Enter one clinical procedure per line." error={errors.keyProcedures} />
              <Textarea label="Destinations *" value={destinations} onChange={event => setDestinations(event.target.value)} placeholder={'One destination per line\nTurkey (Istanbul)\nIndia (New Delhi)'} helperText="Enter one destination per line." error={errors.destinations} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">Card Image *</label>
              {image ? (
                <div className="relative overflow-hidden rounded-xl border border-[#D9DDE8] dark:border-[#252B5C]"><img src={image} alt="Health service preview" className="h-72 w-full object-cover" /><button type="button" onClick={() => setImage('')} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1030]/75 text-white hover:bg-rose-600" aria-label="Remove image"><X className="h-4 w-4" /></button><label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-[#151A46] shadow-lg"><Upload className="h-4 w-4 text-[#FF7817]" /> Change Image<input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" /></label></div>
              ) : (
                <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C5CBE0] bg-[#F8F9FC] px-6 py-8 text-center hover:border-[#FF7817] dark:border-[#3A4070] dark:bg-[#0B1030]"><ImageIcon className="mb-3 h-7 w-7 text-[#FF7817]" /><span className="text-sm font-bold text-[#151A46] dark:text-white">Upload Health Service Image</span><span className="mt-1 text-xs text-[#8A90A2]">PNG, JPG or WebP · maximum 5 MB</span><input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" /></label>
              )}
              {errors.image && <p className="mt-2 text-xs font-medium text-rose-500">{errors.image}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C]"><Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Cancel</Button><Button type="submit" variant="accent" size="lg" isLoading={isSaving} leftIcon={<CheckCircle2 className="h-5 w-5" />}>{editing ? 'Save Changes' : 'Add Health Service'}</Button></div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health"
        subtitle="Manage the clinical specialties displayed on the public Health page."
        action={<Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>Add Health Service</Button>}
      />

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="flex flex-col gap-4 border-b border-[#D9DDE8] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#252B5C]">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90A2]" />
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search specialties, categories, or destinations..." className="h-12 w-full rounded-xl border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map(index => <div key={index} className="h-20 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />)}</div>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={<HeartPulse className="h-8 w-8" />} title={search ? 'No matching health specialties' : 'No health specialties added yet'} description={search ? 'Try a different search term.' : 'Add the first service to publish it on the Health page.'} actionLabel={search ? undefined : 'Add Health Service'} onAction={search ? undefined : openCreateForm} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]">
                <tr><th className="px-6 py-4">Health Service</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Clinical Focus</th><th className="px-6 py-4">Destinations</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Created</th><th className="px-6 py-4 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]">
                    <td className="px-6 py-5"><div className="flex items-center gap-3"><img src={item.image} alt="" className="h-12 w-16 shrink-0 rounded-xl border border-[#D9DDE8] object-cover dark:border-[#252B5C]" /><div className="max-w-xs"><p className="font-semibold text-[#171A2B] dark:text-white">{item.name}</p><p className="line-clamp-1 text-xs text-[#8A90A2]">{item.city}, {item.country}</p></div></div></td>
                    <td className="px-6 py-5 text-sm text-[#5F667A] dark:text-[#D9DDE8]">{item.category}</td>
                    <td className="px-6 py-5 text-sm text-[#5F667A] dark:text-[#D9DDE8]">{item.keyProcedures.length} items</td>
                    <td className="max-w-xs px-6 py-5 text-sm text-[#5F667A] dark:text-[#D9DDE8]"><p className="line-clamp-2">{item.destinations.join(', ')}</p></td>
                    <td className="px-6 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300'}`}>{item.status}</span></td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-5 text-center"><ActionMenu actions={[{ label: 'Edit Health Service', icon: <Edit3 className="h-4 w-4" />, onClick: () => openEditForm(item) }, { label: 'Delete Health Service', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleting(item), variant: 'danger' }]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Health Service" message={`Are you sure you want to delete “${deleting?.name || ''}”? It will also disappear from the public Health page.`} confirmText="Delete Health Service" isLoading={isSaving} />
    </div>
  );
};

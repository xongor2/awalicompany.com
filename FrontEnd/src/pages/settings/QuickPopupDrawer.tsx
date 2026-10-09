import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AlignRight, CheckCircle2, Image as ImageIcon, LayoutPanelTop, MonitorUp, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import type {
  QuickPopup,
  QuickPopupDelayUnit,
  QuickPopupDesign,
  QuickPopupDisplayPage,
  QuickPopupRepeatUnit,
  QuickPopupStatus,
  QuickPopupType,
} from '../../types';

export type QuickPopupPayload = Omit<QuickPopup, 'id' | 'createdAt' | 'updatedAt'>;

interface Draft {
  name: string;
  popupType: QuickPopupType;
  designType: QuickPopupDesign;
  image: string;
  destinationLink: string;
  title: string;
  body: string;
  footer: string;
  displayPage: QuickPopupDisplayPage;
  showAfterValue: string;
  showAfterUnit: QuickPopupDelayUnit;
  showAfterScroll: string;
  maximumDisplays: string;
  repeatEveryValue: string;
  repeatEveryUnit: QuickPopupRepeatUnit;
  status: QuickPopupStatus;
}

type ErrorKey = keyof Draft;
type Errors = Partial<Record<ErrorKey, string>>;

const blankDraft = (): Draft => ({
  name: '', popupType: 'Right Sidebar', designType: 'Custom Content', image: '', destinationLink: '',
  title: '', body: '', footer: '', displayPage: 'Home', showAfterValue: '', showAfterUnit: 'Seconds',
  showAfterScroll: '', maximumDisplays: '1', repeatEveryValue: '1', repeatEveryUnit: 'Days', status: 'Inactive',
});

const itemToDraft = (item: QuickPopup): Draft => ({
  name: item.name,
  popupType: item.popupType,
  designType: item.designType,
  image: item.image || '',
  destinationLink: item.destinationLink || '',
  title: item.title || '',
  body: item.body || '',
  footer: item.footer || '',
  displayPage: item.displayPage,
  showAfterValue: item.showAfterValue === null ? '' : String(item.showAfterValue),
  showAfterUnit: item.showAfterUnit || 'Seconds',
  showAfterScroll: item.showAfterScroll === null ? '' : String(item.showAfterScroll),
  maximumDisplays: String(item.maximumDisplays),
  repeatEveryValue: String(item.repeatEveryValue),
  repeatEveryUnit: item.repeatEveryUnit,
  status: item.status,
});

const wholeNumber = (value: string, minimum: number, maximum: number) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= minimum && number <= maximum;
};

const validHttpUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const validate = (draft: Draft): Errors => {
  const errors: Errors = {};
  if (!draft.name.trim()) errors.name = 'Popup Name is required.';
  if (draft.name.trim().length > 180) errors.name = 'Popup Name must be 180 characters or fewer.';
  if (draft.designType === 'Image') {
    if (!draft.image) errors.image = 'Upload a JPG, PNG, or WebP image.';
    if (!validHttpUrl(draft.destinationLink)) errors.destinationLink = 'Enter a valid HTTP or HTTPS URL.';
  } else {
    if (!draft.title.trim()) errors.title = 'Title is required.';
    if (draft.title.length > 220) errors.title = 'Title must be 220 characters or fewer.';
    if (!draft.body.trim()) errors.body = 'Body is required.';
    if (draft.body.length > 10_000) errors.body = 'Body must be 10,000 characters or fewer.';
    if (draft.footer.length > 500) errors.footer = 'Footer must be 500 characters or fewer.';
  }
  if (draft.showAfterValue && !wholeNumber(draft.showAfterValue, 1, 10_080)) errors.showAfterValue = 'Use a whole number from 1 to 10,080.';
  if (draft.showAfterScroll && !wholeNumber(draft.showAfterScroll, 1, 100)) errors.showAfterScroll = 'Use a whole percentage from 1 to 100.';
  if (!wholeNumber(draft.maximumDisplays, 1, 1_000)) errors.maximumDisplays = 'Use a whole number from 1 to 1,000.';
  if (!wholeNumber(draft.repeatEveryValue, 1, 8_760)) errors.repeatEveryValue = 'Use a whole number from 1 to 8,760.';
  return errors;
};

const toPayload = (draft: Draft): QuickPopupPayload => ({
  name: draft.name.trim(),
  popupType: draft.popupType,
  designType: draft.designType,
  image: draft.designType === 'Image' ? draft.image : null,
  destinationLink: draft.designType === 'Image' && draft.destinationLink.trim() ? draft.destinationLink.trim() : null,
  title: draft.designType === 'Custom Content' ? draft.title.trim() : null,
  body: draft.designType === 'Custom Content' ? draft.body.trim() : null,
  footer: draft.designType === 'Custom Content' && draft.footer.trim() ? draft.footer.trim() : null,
  displayPage: draft.displayPage,
  showAfterValue: draft.showAfterValue ? Number(draft.showAfterValue) : null,
  showAfterUnit: draft.showAfterValue ? draft.showAfterUnit : null,
  showAfterScroll: draft.showAfterScroll ? Number(draft.showAfterScroll) : null,
  maximumDisplays: Number(draft.maximumDisplays),
  repeatEveryValue: Number(draft.repeatEveryValue),
  repeatEveryUnit: draft.repeatEveryUnit,
  status: draft.status,
});

interface QuickPopupDrawerProps {
  item: QuickPopup | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: QuickPopupPayload) => Promise<void>;
  onPreview: (popup: QuickPopup) => void;
}

export const QuickPopupDrawer: React.FC<QuickPopupDrawerProps> = ({ item, isSaving, onClose, onSave, onPreview }) => {
  const [draft, setDraft] = useState<Draft>(() => item ? itemToDraft(item) : blankDraft());
  const [errors, setErrors] = useState<Errors>({});
  const [imageError, setImageError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const setField = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors(current => ({ ...current, image: 'Use a JPG, PNG, or WebP image.' }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrors(current => ({ ...current, image: 'Image must be 4 MB or smaller.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const probe = new Image();
      probe.onload = () => {
        setField('image', reader.result as string);
        setImageError('');
      };
      probe.onerror = () => setErrors(current => ({ ...current, image: 'This file is not a readable image.' }));
      probe.src = reader.result;
    };
    reader.onerror = () => setErrors(current => ({ ...current, image: 'Unable to read this image.' }));
    reader.readAsDataURL(file);
  };

  const validateAndBuild = () => {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return null;
    return toPayload(draft);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = validateAndBuild();
    if (payload) await onSave(payload);
  };

  const handlePreview = () => {
    const payload = validateAndBuild();
    if (!payload) return;
    const now = new Date().toISOString();
    onPreview({ ...payload, id: item?.id || 'quick-popup-preview', createdAt: item?.createdAt || now, updatedAt: now });
  };

  const triggerSummary = draft.showAfterValue
    ? `Popup will display ${draft.showAfterValue} ${draft.showAfterUnit.toLowerCase()} after visitors open the ${draft.displayPage} page.`
    : draft.showAfterScroll
      ? `Popup will display after visitors scroll through ${draft.showAfterScroll}% of the ${draft.displayPage} page.`
      : `Popup will display immediately when visitors open the ${draft.displayPage} page.`;
  const repeatSummary = `Each visitor can see this popup up to ${draft.maximumDisplays || '—'} ${Number(draft.maximumDisplays) === 1 ? 'time' : 'times'} every ${draft.repeatEveryValue || '—'} ${Number(draft.repeatEveryValue) === 1 ? draft.repeatEveryUnit.slice(0, -1).toLowerCase() : draft.repeatEveryUnit.toLowerCase()}.`;

  return (
    <div className="fixed inset-0 z-[80] bg-[#0B1030]/55 backdrop-blur-[2px]" onMouseDown={event => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-[#D9DDE8] bg-[#F8F9FC] shadow-2xl quick-popup-slide-in dark:border-[#252B5C] dark:bg-[#0B1030]" role="dialog" aria-modal="true" aria-labelledby="quick-popup-drawer-title">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#D9DDE8] bg-white px-5 py-5 dark:border-[#252B5C] dark:bg-[#151A46] sm:px-7">
          <div>
            <h2 id="quick-popup-drawer-title" className="font-heading text-xl font-bold text-[#171A2B] dark:text-white">{item ? 'Edit Pop Up' : 'Create Pop Up'}</h2>
            <p className="mt-1 text-sm text-[#5F667A] dark:text-[#8A90A2]">Configure the design, location, and display behavior of your popup.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg p-2 text-[#5F667A] hover:bg-[#EEF0F5] hover:text-[#171A2B] disabled:opacity-50 dark:text-[#AEB4C7] dark:hover:bg-[#252B5C] dark:hover:text-white" aria-label="Close popup editor"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <section className="space-y-4 rounded-xl border border-[#D9DDE8] bg-white p-5 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF7817]">Popup Details</p><h3 className="mt-1 font-heading text-lg font-bold text-[#171A2B] dark:text-white">Administrative identity</h3></div>
            <Input ref={nameRef} label="Popup Name *" value={draft.name} maxLength={180} onChange={event => setField('name', event.target.value)} placeholder="New Student Registration Campaign" helperText={`${draft.name.length}/180 characters · Visitors do not see this name.`} error={errors.name} />
          </section>

          <section className="space-y-4 rounded-xl border border-[#D9DDE8] bg-white p-5 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF7817]">Popup Type</p><h3 className="mt-1 font-heading text-lg font-bold text-[#171A2B] dark:text-white">Choose where it appears</h3></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { value: 'Right Sidebar' as const, icon: AlignRight, description: 'Slides into view from the right edge of the screen.' },
                { value: 'Screen Modal' as const, icon: LayoutPanelTop, description: 'Appears centrally with space around every edge.' },
              ]).map(option => {
                const Icon = option.icon;
                const selected = draft.popupType === option.value;
                return <button key={option.value} type="button" onClick={() => setField('popupType', option.value)} className={`rounded-xl border p-4 text-left transition ${selected ? 'border-[#FF7817] bg-[#FFF6EF] ring-2 ring-[#FF7817]/15 dark:bg-[#FF7817]/10' : 'border-[#D9DDE8] hover:border-[#FF7817]/50 dark:border-[#252B5C]'}`} aria-pressed={selected}><Icon className={`h-5 w-5 ${selected ? 'text-[#FF7817]' : 'text-[#5F667A] dark:text-[#AEB4C7]'}`} /><span className="mt-3 block text-sm font-bold text-[#171A2B] dark:text-white">{option.value}</span><span className="mt-1 block text-xs leading-5 text-[#5F667A] dark:text-[#8A90A2]">{option.description}</span></button>;
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[#D9DDE8] bg-white p-5 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF7817]">Design Type</p><h3 className="mt-1 font-heading text-lg font-bold text-[#171A2B] dark:text-white">Build the visitor experience</h3></div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#EEF0F5] p-1.5 dark:bg-[#0B1030]">
              {(['Image', 'Custom Content'] as QuickPopupDesign[]).map(value => <button key={value} type="button" onClick={() => { if (value === 'Custom Content' && draft.designType !== value) setDraft(current => ({ ...current, designType: value, image: '', destinationLink: '' })); else setField('designType', value); setErrors({}); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${draft.designType === value ? 'bg-white text-[#151A46] shadow-sm dark:bg-[#252B5C] dark:text-white' : 'text-[#5F667A] hover:text-[#171A2B] dark:text-[#8A90A2] dark:hover:text-white'}`}>{value}</button>)}
            </div>
            {draft.designType === 'Image' ? (
              <div className="space-y-4">
                {draft.image ? <div className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] dark:border-[#252B5C] dark:bg-[#0B1030]"><img src={draft.image} alt="Selected popup" onError={() => setImageError('The selected image can no longer be displayed.')} className="max-h-80 w-full object-contain" />{imageError ? <p className="p-3 text-xs text-rose-500">{imageError}</p> : null}<div className="flex gap-2 border-t border-[#D9DDE8] p-3 dark:border-[#252B5C]"><label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#D9DDE8] bg-white px-3 text-xs font-bold text-[#171A2B] hover:bg-[#EEF0F5] dark:border-[#252B5C] dark:bg-[#151A46] dark:text-white dark:hover:bg-[#252B5C]"><Upload className="h-4 w-4" />Replace<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="sr-only" /></label><button type="button" onClick={() => setField('image', '')} className="h-9 rounded-lg px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">Remove</button></div></div> : <label className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center transition ${errors.image ? 'border-rose-500' : 'border-[#C5CBE0] hover:border-[#FF7817] dark:border-[#3A4070]'}`}><span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFF1E6] text-[#FF7817] dark:bg-[#FF7817]/10"><ImageIcon className="h-6 w-6" /></span><span className="mt-3 text-sm font-bold text-[#171A2B] dark:text-white">Upload Popup Image</span><span className="mt-1 text-xs text-[#8A90A2]">JPG, PNG or WebP · up to 4 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="sr-only" /></label>}
                {errors.image ? <p className="text-xs font-medium text-rose-500">{errors.image}</p> : null}
                <Input label="Destination Link" type="url" value={draft.destinationLink} onChange={event => setField('destinationLink', event.target.value)} placeholder="https://example.com/learn-more" helperText="Optional. Opens in a new browser tab when the image is clicked." error={errors.destinationLink} />
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Title *" value={draft.title} maxLength={220} onChange={event => setField('title', event.target.value)} placeholder="Admissions are now open" helperText={`${draft.title.length}/220 characters`} error={errors.title} />
                <Textarea label="Body *" value={draft.body} maxLength={10_000} rows={7} onChange={event => setField('body', event.target.value)} placeholder="Write the message visitors should see." helperText={`${draft.body.length}/10,000 characters · Line breaks are preserved.`} error={errors.body} />
                <Textarea label="Footer" value={draft.footer} maxLength={500} rows={3} onChange={event => setField('footer', event.target.value)} placeholder="Optional supporting note" helperText={`${draft.footer.length}/500 characters`} error={errors.footer} />
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-xl border border-[#D9DDE8] bg-white p-5 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF7817]">Display Rules</p><h3 className="mt-1 font-heading text-lg font-bold text-[#171A2B] dark:text-white">Page, trigger, and repeat frequency</h3></div>
            <Select label="Display Page *" value={draft.displayPage} onChange={event => setField('displayPage', event.target.value as QuickPopupDisplayPage)} options={['Home', 'Academic', 'Courses', 'Admissions', 'News', 'About Us', 'Contact'].map(value => ({ value, label: value }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
                <Input label="Show After" type="number" min={1} max={10080} step={1} value={draft.showAfterValue} onChange={event => { const value = event.target.value; setDraft(current => ({ ...current, showAfterValue: value, showAfterScroll: value ? '' : current.showAfterScroll })); setErrors(current => ({ ...current, showAfterValue: undefined, showAfterScroll: undefined })); }} placeholder="Immediately" error={errors.showAfterValue} />
                <Select label="Unit" value={draft.showAfterUnit} onChange={event => setField('showAfterUnit', event.target.value as QuickPopupDelayUnit)} options={[{ value: 'Seconds', label: 'Seconds' }, { value: 'Minutes', label: 'Minutes' }]} />
              </div>
              <Input label="Show After Scroll (%)" type="number" min={1} max={100} step={1} value={draft.showAfterScroll} disabled={Boolean(draft.showAfterValue)} onChange={event => setField('showAfterScroll', event.target.value)} placeholder="Immediately" helperText={draft.showAfterValue ? 'Disabled while a time delay is configured.' : 'Leave empty to display immediately.'} error={errors.showAfterScroll} />
            </div>
            <div className="rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] p-3 text-sm font-medium leading-6 text-[#4B5368] dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-[#D9DDE8]">{triggerSummary}</div>
            <div className="border-t border-[#D9DDE8] pt-4 dark:border-[#252B5C]"><h4 className="text-sm font-bold text-[#171A2B] dark:text-white">Repeat Frequency</h4><div className="mt-3 grid gap-4 sm:grid-cols-3"><Input label="Maximum Displays *" type="number" min={1} max={1000} step={1} value={draft.maximumDisplays} onChange={event => setField('maximumDisplays', event.target.value)} error={errors.maximumDisplays} /><Input label="Within Every *" type="number" min={1} max={8760} step={1} value={draft.repeatEveryValue} onChange={event => setField('repeatEveryValue', event.target.value)} error={errors.repeatEveryValue} /><Select label="Unit *" value={draft.repeatEveryUnit} onChange={event => setField('repeatEveryUnit', event.target.value as QuickPopupRepeatUnit)} options={[{ value: 'Hours', label: 'Hours' }, { value: 'Days', label: 'Days' }]} /></div><p className="mt-3 text-xs font-semibold text-[#5F667A] dark:text-[#AEB4C7]">{repeatSummary}</p></div>
          </section>

          <section className="space-y-4 rounded-xl border border-[#D9DDE8] bg-white p-5 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF7817]">Status & Preview</p><h3 className="mt-1 font-heading text-lg font-bold text-[#171A2B] dark:text-white">Review before publishing</h3></div>
            <Select label="Status *" value={draft.status} onChange={event => setField('status', event.target.value as QuickPopupStatus)} options={[{ value: 'Inactive', label: 'Inactive' }, { value: 'Active', label: 'Active' }]} helperText="New popups start Inactive until you are ready to publish." />
            <Button type="button" variant="secondary" onClick={handlePreview} leftIcon={<MonitorUp className="h-4 w-4" />}>Preview Pop Up</Button>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C] sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" variant="accent" size="lg" isLoading={isSaving} leftIcon={<CheckCircle2 className="h-5 w-5" />}>{isSaving ? 'Saving...' : item ? 'Save Changes' : 'Create Pop Up'}</Button>
          </div>
        </form>
      </aside>
    </div>
  );
};

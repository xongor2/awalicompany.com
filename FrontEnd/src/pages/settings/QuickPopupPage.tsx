import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Eye, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { QuickPopupDisplay } from '../../components/public/QuickPopupDisplay';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { QuickPopup, QuickPopupStatus } from '../../types';
import { QuickPopupDrawer, QuickPopupPayload } from './QuickPopupDrawer';

const triggerLabel = (popup: QuickPopup) => {
  if (popup.showAfterValue !== null) return `After ${popup.showAfterValue} ${popup.showAfterUnit?.toLowerCase()}`;
  if (popup.showAfterScroll !== null) return `After ${popup.showAfterScroll}% scroll`;
  return 'Immediately';
};

const repeatLabel = (popup: QuickPopup) =>
  `Up to ${popup.maximumDisplays}× every ${popup.repeatEveryValue} ${popup.repeatEveryUnit.toLowerCase()}`;

const contentTitle = (popup: QuickPopup) => popup.designType === 'Image' ? 'Image announcement' : popup.title;

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, children, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={`grid h-9 w-9 place-items-center rounded-lg border transition ${danger ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30' : 'border-[#D9DDE8] text-[#5F667A] hover:border-[#FF7817] hover:bg-[#FFF6EF] hover:text-[#E66606] dark:border-[#252B5C] dark:text-[#AEB4C7] dark:hover:border-[#FF7817] dark:hover:bg-[#FF7817]/10 dark:hover:text-[#FF9A52]'}`}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

export const QuickPopupPage: React.FC = () => {
  const [items, setItems] = useState<QuickPopup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [drawerItem, setDrawerItem] = useState<QuickPopup | null | undefined>(undefined);
  const [preview, setPreview] = useState<QuickPopup | null>(null);
  const [deleting, setDeleting] = useState<QuickPopup | null>(null);
  const [updatingStatuses, setUpdatingStatuses] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const loadItems = useCallback(async (withLoading = true) => {
    if (withLoading) setIsLoading(true);
    try {
      setItems(await api.getQuickPopups());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load popups.', 'error');
    } finally {
      if (withLoading) setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const handleSave = async (payload: QuickPopupPayload) => {
    setIsSaving(true);
    try {
      if (drawerItem) {
        await api.updateQuickPopup(drawerItem.id, payload);
        showToast('Popup updated successfully.', 'success');
      } else {
        await api.createQuickPopup(payload);
        showToast('Popup created successfully.', 'success');
      }
      setDrawerItem(undefined);
      await loadItems(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save popup.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (item: QuickPopup) => {
    const nextStatus: QuickPopupStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    setUpdatingStatuses(current => new Set(current).add(item.id));
    try {
      await api.updateQuickPopupStatus(item.id, nextStatus);
      showToast(`Popup changed to ${nextStatus}.`, 'success');
      await loadItems(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update popup status.', 'error');
    } finally {
      setUpdatingStatuses(current => { const next = new Set(current); next.delete(item.id); return next; });
    }
  };

  const handleDuplicate = async (item: QuickPopup) => {
    setIsSaving(true);
    try {
      await api.duplicateQuickPopup(item.id);
      showToast('Popup duplicated successfully. The copy is Inactive.', 'success');
      await loadItems(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to duplicate popup.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteQuickPopup(deleting.id);
      showToast('Popup deleted successfully.', 'success');
      setDeleting(null);
      await loadItems(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to delete popup.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const actions = (item: QuickPopup) => (
    <div className="flex items-center gap-2">
      <ActionButton label={`Preview ${item.name}`} onClick={() => setPreview(item)}><Eye className="h-4 w-4" /></ActionButton>
      <ActionButton label={`Edit ${item.name}`} onClick={() => setDrawerItem(item)}><Pencil className="h-4 w-4" /></ActionButton>
      <ActionButton label={`Duplicate ${item.name}`} onClick={() => void handleDuplicate(item)}><Copy className="h-4 w-4" /></ActionButton>
      <ActionButton label={`Delete ${item.name}`} onClick={() => setDeleting(item)} danger><Trash2 className="h-4 w-4" /></ActionButton>
    </div>
  );

  const statusSwitch = (item: QuickPopup) => {
    const active = item.status === 'Active';
    const busy = updatingStatuses.has(item.id);
    return (
      <div className="flex items-center gap-2.5">
        <button type="button" role="switch" aria-checked={active} aria-label={`Set ${item.name} ${active ? 'Inactive' : 'Active'}`} disabled={busy} onClick={() => void handleStatusChange(item)} className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7817] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${active ? 'bg-[#FF7817]' : 'bg-[#C5CBE0] dark:bg-[#3A4070]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} /></button>
        <span className="text-xs font-bold text-[#4B5368] dark:text-[#D9DDE8]">{busy ? 'Saving...' : item.status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold text-[#8A90A2]"><span>Settings</span><span className="mx-2">›</span><span className="text-[#FF7817]">Quick Pop Up</span></div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FF7817]">Website Engagement</p>
        <PageHeader title="Quick Pop Up" subtitle="Manage website popups, display rules, designs, and trigger behavior." action={<Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setDrawerItem(null)}>Create Pop Up</Button>} />
      </div>

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="border-b border-[#D9DDE8] px-5 pt-4 dark:border-[#252B5C]">
          <div className="inline-flex items-center gap-2 border-b-2 border-[#FF7817] px-1 pb-3 text-sm font-bold text-[#151A46] dark:text-white"><Megaphone className="h-4 w-4 text-[#FF7817]" />Popups <span className="rounded-full bg-[#FFF1E6] px-2 py-0.5 text-xs text-[#E66606] dark:bg-[#FF7817]/15 dark:text-[#FF9A52]">{items.length}</span></div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm font-semibold text-[#5F667A] dark:text-[#AEB4C7]">Loading popups...</div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Megaphone className="h-8 w-8" />} title="No Popups Yet" description="Create your first popup to announce important content on the public website." actionLabel="Create Pop Up" onAction={() => setDrawerItem(null)} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1180px] text-left">
                <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]"><tr><th className="px-5 py-4">Popup Name / Title</th><th className="px-5 py-4">Popup Type</th><th className="px-5 py-4">Design</th><th className="px-5 py-4">Display Page</th><th className="px-5 py-4">Trigger</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Actions</th></tr></thead>
                <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                  {items.map(item => <tr key={item.id} className="align-top transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]"><td className="max-w-xs px-5 py-5"><p className="font-bold text-[#171A2B] dark:text-white">{item.name}</p><p className="mt-1 line-clamp-2 text-xs text-[#8A90A2]">{contentTitle(item)}</p></td><td className="whitespace-nowrap px-5 py-5 text-sm text-[#4B5368] dark:text-[#D9DDE8]">{item.popupType}</td><td className="whitespace-nowrap px-5 py-5 text-sm text-[#4B5368] dark:text-[#D9DDE8]">{item.designType}</td><td className="px-5 py-5"><span className="rounded-full bg-[#EEF0F5] px-2.5 py-1 text-xs font-bold text-[#4B5368] dark:bg-[#252B5C] dark:text-[#D9DDE8]">{item.displayPage}</span></td><td className="px-5 py-5"><p className="whitespace-nowrap text-sm font-semibold text-[#171A2B] dark:text-white">{triggerLabel(item)}</p><p className="mt-1 whitespace-nowrap text-xs text-[#8A90A2]">{repeatLabel(item)}</p></td><td className="px-5 py-5">{statusSwitch(item)}</td><td className="whitespace-nowrap px-5 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td className="px-5 py-5">{actions(item)}</td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 p-4 md:hidden">
              {items.map(item => <article key={item.id} className="rounded-xl border border-[#D9DDE8] p-4 dark:border-[#252B5C]"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-[#171A2B] dark:text-white">{item.name}</p><p className="mt-1 text-xs text-[#8A90A2]">{contentTitle(item)}</p></div>{statusSwitch(item)}</div><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#E8EAF0] py-4 text-sm dark:border-[#252B5C]"><div><dt className="text-[10px] font-bold uppercase text-[#8A90A2]">Popup Type</dt><dd className="mt-1 text-[#171A2B] dark:text-white">{item.popupType}</dd></div><div><dt className="text-[10px] font-bold uppercase text-[#8A90A2]">Design</dt><dd className="mt-1 text-[#171A2B] dark:text-white">{item.designType}</dd></div><div><dt className="text-[10px] font-bold uppercase text-[#8A90A2]">Display Page</dt><dd className="mt-1 text-[#171A2B] dark:text-white">{item.displayPage}</dd></div><div><dt className="text-[10px] font-bold uppercase text-[#8A90A2]">Created</dt><dd className="mt-1 text-[#171A2B] dark:text-white">{new Date(item.createdAt).toLocaleDateString()}</dd></div><div className="col-span-2"><dt className="text-[10px] font-bold uppercase text-[#8A90A2]">Trigger</dt><dd className="mt-1 text-[#171A2B] dark:text-white">{triggerLabel(item)}</dd><dd className="text-xs text-[#8A90A2]">{repeatLabel(item)}</dd></div></dl><div className="mt-4">{actions(item)}</div></article>)}
            </div>
          </>
        )}
      </section>

      {drawerItem !== undefined ? <QuickPopupDrawer key={drawerItem?.id || 'new'} item={drawerItem} isSaving={isSaving} onClose={() => !isSaving && setDrawerItem(undefined)} onSave={handleSave} onPreview={setPreview} /> : null}
      {preview ? <QuickPopupDisplay popup={preview} onClose={() => setPreview(null)} /> : null}
      <ConfirmModal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Pop Up" message={`Are you sure you want to delete “${deleting?.name || ''}”? This removes it from the public website and cannot be undone.`} confirmText="Delete Pop Up" isLoading={isSaving} />
    </div>
  );
};

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, Globe2, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { PropertyLocationCategory, PropertyLocationKind } from '../../types';

interface LocationCategoriesPageProps {
  kind: PropertyLocationKind;
}

export const LocationCategoriesPage: React.FC<LocationCategoriesPageProps> = ({ kind }) => {
  const [items, setItems] = useState<PropertyLocationCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<PropertyLocationCategory | null>(null);
  const [deleting, setDeleting] = useState<PropertyLocationCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const { showToast } = useToast();

  const plural = kind === 'Country' ? 'Countries' : 'Cities';
  const Icon = kind === 'Country' ? Globe2 : MapPin;

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await api.getPropertyLocationCategories(kind));
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to load ${plural.toLowerCase()}.`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [kind, plural, showToast]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term),
    );
  }, [items, search]);

  const openCreateForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setNameError('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: PropertyLocationCategory) => {
    setEditing(item);
    setName(item.name);
    setDescription(item.description);
    setNameError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setNameError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(`${kind} name is required.`);
      return;
    }

    setIsSaving(true);
    setNameError('');
    try {
      if (editing) {
        await api.updatePropertyLocationCategory(kind, editing.id, {
          name: trimmedName,
          description: description.trim(),
        });
        showToast(`${kind} updated successfully.`, 'success');
      } else {
        await api.createPropertyLocationCategory(kind, {
          name: trimmedName,
          description: description.trim(),
        });
        showToast(`${kind} created successfully.`, 'success');
      }
      closeForm();
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to save ${kind.toLowerCase()}.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deletePropertyLocationCategory(kind, deleting.id);
      showToast(`${kind} deleted successfully.`, 'success');
      setDeleting(null);
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to delete ${kind.toLowerCase()}.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={plural}
        subtitle={`Manage ${plural.toLowerCase()} used to organize real estate listings.`}
        action={(
          <Button variant="accent" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateForm}>
            Add {kind}
          </Button>
        )}
      />

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="flex flex-col gap-4 border-b border-[#D9DDE8] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#252B5C]">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90A2]" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={`Search ${plural.toLowerCase()} by name...`}
              aria-label={`Search ${plural.toLowerCase()}`}
              className="h-12 w-full rounded-xl border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none transition focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6" aria-label={`Loading ${plural.toLowerCase()}`}>
            {[0, 1, 2].map(index => (
              <div key={index} className="h-16 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Icon className="h-7 w-7" />}
            title={search ? `No matching ${plural.toLowerCase()}` : `No ${plural.toLowerCase()} yet`}
            description={search ? 'Try a different search term.' : `Create the first ${kind.toLowerCase()} category for properties.`}
            actionLabel={search ? undefined : `Add ${kind}`}
            onAction={search ? undefined : openCreateForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Properties</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E4] text-[#FF7817] dark:bg-[#252B5C]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-semibold text-[#171A2B] dark:text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="max-w-lg px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">
                      {item.description || '—'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#FFF0E4] px-2 text-sm font-bold text-[#E66606] dark:bg-[#252B5C] dark:text-[#FF9A52]">
                        {item.listingCount}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <ActionMenu actions={[
                        { label: `Edit ${kind}`, icon: <Edit3 className="h-4 w-4" />, onClick: () => openEditForm(item) },
                        { label: `Delete ${kind}`, icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleting(item), variant: 'danger' },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={`${editing ? 'Edit' : 'Create'} ${kind}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={`${kind} *`}
            value={name}
            onChange={event => {
              setName(event.target.value);
              if (nameError) setNameError('');
            }}
            placeholder={`${editing ? 'Edit' : 'Create'} ${kind}`}
            error={nameError}
            autoFocus
          />
          <Textarea
            label="Description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder={`Optional description of this ${kind.toLowerCase()}`}
            className="min-h-[170px]"
          />
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              {editing ? `Save ${kind}` : `Create ${kind}`}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${kind}`}
        message={`Are you sure you want to delete “${deleting?.name || ''}”? Existing property listings will not be deleted.`}
        confirmText={`Delete ${kind}`}
        isLoading={isSaving}
      />
    </div>
  );
};

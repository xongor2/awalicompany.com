import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  GraduationCap,
  Link2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
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
import type { EducationDegree, EducationOpportunity } from '../../types';

const DEGREE_OPTIONS: EducationDegree[] = ['Certificate', 'Bachelor', 'Master', 'PHD'];

type FormErrors = Partial<Record<'title' | 'description' | 'availableDegrees' | 'universityUrl', string>>;

const normalizeUniversityUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

export const EducationPage: React.FC = () => {
  const [items, setItems] = useState<EducationOpportunity[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<EducationOpportunity | null>(null);
  const [deleting, setDeleting] = useState<EducationOpportunity | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [availableDegrees, setAvailableDegrees] = useState<EducationDegree[]>([]);
  const [universityUrl, setUniversityUrl] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await api.getEducationOpportunities());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load education opportunities.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.availableDegrees.some(degree => degree.toLowerCase().includes(term)),
    );
  }, [items, search]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAvailableDegrees([]);
    setUniversityUrl('');
    setErrors({});
  };

  const openCreateForm = () => {
    setEditing(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (item: EducationOpportunity) => {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setAvailableDegrees(item.availableDegrees);
    setUniversityUrl(item.universityUrl);
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    resetForm();
  };

  const toggleDegree = (degree: EducationDegree) => {
    setAvailableDegrees(current =>
      current.includes(degree) ? current.filter(item => item !== degree) : [...current, degree],
    );
    setErrors(current => ({ ...current, availableDegrees: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const normalizedUrl = normalizeUniversityUrl(universityUrl);

    if (!trimmedTitle) nextErrors.title = 'University title is required.';
    if (!trimmedDescription) nextErrors.description = 'Description is required.';
    if (availableDegrees.length === 0) nextErrors.availableDegrees = 'Select at least one available degree.';
    if (!normalizedUrl) nextErrors.universityUrl = 'Enter a valid university website link.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: trimmedDescription,
      availableDegrees,
      universityUrl: normalizedUrl!,
    };

    setIsSaving(true);
    try {
      if (editing) {
        await api.updateEducationOpportunity(editing.id, payload);
        showToast('University opportunity updated successfully.', 'success');
      } else {
        await api.createEducationOpportunity(payload);
        showToast('University opportunity created successfully.', 'success');
      }
      closeForm();
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save university opportunity.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteEducationOpportunity(deleting.id);
      showToast('University opportunity deleted successfully.', 'success');
      setDeleting(null);
      await loadItems();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete university opportunity.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Education"
        subtitle="Manage universities with open admission opportunities and available degree programs."
        action={(
          <Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>
            Add University
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
              placeholder="Search universities or degrees..."
              aria-label="Search education opportunities"
              className="h-12 w-full rounded-xl border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none transition focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6" aria-label="Loading education opportunities">
            {[0, 1, 2].map(index => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-8 w-8" />}
            title={search ? 'No matching universities' : 'No universities added yet'}
            description={search ? 'Try a different search term.' : 'Add the first university with an open admission opportunity.'}
            actionLabel={search ? undefined : 'Add University'}
            onAction={search ? undefined : openCreateForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]">
                <tr>
                  <th className="px-6 py-4">University</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Available Degrees</th>
                  <th className="px-6 py-4">University Link</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E4] text-[#FF7817] dark:bg-[#252B5C]">
                          <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="font-semibold text-[#171A2B] dark:text-white">{item.title}</span>
                      </div>
                    </td>
                    <td className="max-w-sm px-6 py-5 text-sm leading-6 text-[#5F667A] dark:text-[#AEB4C7]">
                      <p className="line-clamp-3">{item.description}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {item.availableDegrees.map(degree => (
                          <span
                            key={degree}
                            className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-xs font-bold text-[#E66606] dark:bg-[#FF7817]/15 dark:text-[#FF9A52]"
                          >
                            {degree}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a
                        href={item.universityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF7817] hover:text-[#E66606] hover:underline"
                      >
                        Visit website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <ActionMenu actions={[
                        { label: 'Edit University', icon: <Edit3 className="h-4 w-4" />, onClick: () => openEditForm(item) },
                        { label: 'Delete University', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleting(item), variant: 'danger' },
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
        title={editing ? 'Edit University Opportunity' : 'Add University Opportunity'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title *"
            value={title}
            onChange={event => {
              setTitle(event.target.value);
              setErrors(current => ({ ...current, title: undefined }));
            }}
            placeholder="e.g. Kownayn University Admissions"
            error={errors.title}
            autoFocus
          />

          <Textarea
            label="Description *"
            value={description}
            onChange={event => {
              setDescription(event.target.value);
              setErrors(current => ({ ...current, description: undefined }));
            }}
            placeholder="Describe the university and its current admission opportunity."
            error={errors.description}
            className="min-h-[150px]"
          />

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">
              Available Degrees *
            </legend>
            <p className="mb-3 text-xs text-[#8A90A2]">Select one or more degree levels.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DEGREE_OPTIONS.map(degree => {
                const selected = availableDegrees.includes(degree);
                return (
                  <label
                    key={degree}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-[#FF7817] bg-[#FFF6EF] text-[#E66606] dark:bg-[#FF7817]/10 dark:text-[#FF9A52]'
                        : 'border-[#D9DDE8] text-[#5F667A] hover:border-[#FF7817]/50 dark:border-[#252B5C] dark:text-[#D9DDE8]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleDegree(degree)}
                      className="h-4 w-4 rounded border-[#C5CBE0] accent-[#FF7817]"
                    />
                    <span>{degree}</span>
                  </label>
                );
              })}
            </div>
            {errors.availableDegrees ? (
              <p className="mt-2 text-xs font-medium text-rose-500">{errors.availableDegrees}</p>
            ) : null}
          </fieldset>

          <Input
            type="url"
            label="University Link *"
            value={universityUrl}
            onChange={event => {
              setUniversityUrl(event.target.value);
              setErrors(current => ({ ...current, universityUrl: undefined }));
            }}
            placeholder="https://university.example/apply"
            helperText="Users will follow this link to visit the university or application page."
            error={errors.universityUrl}
            leftIcon={<Link2 className="h-4 w-4" />}
          />

          <div className="flex justify-end gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C]">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              {editing ? 'Save Changes' : 'Add University'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete University Opportunity"
        message={`Are you sure you want to delete “${deleting?.title || ''}”? This record will be permanently removed.`}
        confirmText="Delete University"
        isLoading={isSaving}
      />
    </div>
  );
};

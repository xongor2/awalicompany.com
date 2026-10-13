import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { BadgePercent, Edit3, Plus, Search, Trash2, UserRoundSearch, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Commission, CommissionService, User } from '../../types';

type CommissionDraft = {
  id: string;
  service: CommissionService | '';
  percentage: string;
};

type AgencyUser = Pick<User, 'id' | 'name' | 'email'>;

const services: CommissionService[] = ['Health', 'Education', 'Real Estate', 'Consulting'];
const serviceOptions = [
  { value: '', label: 'Select a service' },
  ...services.map(service => ({ value: service, label: service })),
];

const createDraft = (): CommissionDraft => ({
  id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  service: '',
  percentage: '',
});

export const CommissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [agencyUsers, setAgencyUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [deleting, setDeleting] = useState<Commission | null>(null);
  const [selectedUser, setSelectedUser] = useState<AgencyUser | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [drafts, setDrafts] = useState<CommissionDraft[]>([createDraft()]);
  const [formError, setFormError] = useState('');

  const loadCommissions = useCallback(async () => {
    setIsLoading(true);
    try {
      setCommissions(await api.getCommissions());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load commissions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadCommissions(); }, [loadCommissions]);

  const loadAgencyUsers = useCallback(async () => {
    try {
      setAgencyUsers(await api.getUsers({ role: 'Agency' }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load Agency users.', 'error');
    }
  }, [showToast]);

  const filteredCommissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return commissions.filter(commission => {
      const matchesSearch = !term || commission.userName.toLowerCase().includes(term)
        || commission.userEmail.toLowerCase().includes(term)
        || commission.service.toLowerCase().includes(term);
      return matchesSearch && (serviceFilter === 'All' || commission.service === serviceFilter);
    });
  }, [commissions, search, serviceFilter]);

  const matchingAgencyUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term || selectedUser) return [];
    return agencyUsers
      .filter(user => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term))
      .slice(0, 8);
  }, [agencyUsers, selectedUser, userSearch]);

  const resetForm = () => {
    setEditing(null);
    setSelectedUser(null);
    setUserSearch('');
    setDrafts([createDraft()]);
    setFormError('');
    setIsUserSearchOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
    void loadAgencyUsers();
  };

  const openEditForm = (commission: Commission) => {
    setEditing(commission);
    setSelectedUser({ id: commission.userId, name: commission.userName, email: commission.userEmail });
    setUserSearch(commission.userName);
    setDrafts([{ id: commission.id, service: commission.service, percentage: String(commission.percentage) }]);
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const updateDraft = (id: string, updates: Partial<CommissionDraft>) => {
    setDrafts(current => current.map(draft => draft.id === id ? { ...draft, ...updates } : draft));
    setFormError('');
  };

  const addDraft = () => {
    if (drafts.length >= services.length) return;
    setDrafts(current => [...current, createDraft()]);
  };

  const removeDraft = (id: string) => {
    if (drafts.length === 1) return;
    setDrafts(current => current.filter(draft => draft.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser) {
      setFormError('Search for and select an Agency user.');
      return;
    }

    const normalized = drafts.map(draft => ({
      service: draft.service,
      percentage: Number(draft.percentage),
    }));
    if (normalized.some(item => !item.service || !Number.isFinite(item.percentage) || item.percentage <= 0 || item.percentage > 100)) {
      setFormError('Every row needs a service and a commission percentage from 0.01 to 100.');
      return;
    }
    if (new Set(normalized.map(item => item.service)).size !== normalized.length) {
      setFormError('Choose each service only once for this user.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      if (editing) {
        const item = normalized[0];
        await api.updateCommission(editing.id, {
          service: item.service as CommissionService,
          percentage: item.percentage,
        });
        showToast('Commission updated successfully.', 'success');
      } else {
        await api.createCommissions({
          userId: selectedUser.id,
          commissions: normalized.map(item => ({
            service: item.service as CommissionService,
            percentage: item.percentage,
          })),
        });
        showToast(`${normalized.length} commission ${normalized.length === 1 ? 'rule' : 'rules'} saved successfully.`, 'success');
      }
      closeForm();
      await loadCommissions();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save commissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteCommission(deleting.id);
      showToast('Commission deleted successfully.', 'success');
      setDeleting(null);
      await loadCommissions();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete commission.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isFormOpen && isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={editing ? 'Edit Commission' : 'Add Commissions'}
          subtitle={editing ? 'Update this service commission rule.' : 'Select an Agency user and assign one or more service commission rules.'}
          action={<Button variant="secondary" onClick={closeForm} disabled={isSaving}>Back to Commissions</Button>}
        />

        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
          <div className="border-b border-[#D9DDE8] bg-[#0F4C81] px-5 py-4 dark:border-[#252B5C]">
            <h2 className="text-lg font-bold text-white">Commission Assignment</h2>
            <p className="mt-1 text-sm text-blue-100">Only users with the Agency role can receive commissions.</p>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <section className="space-y-3">
              <div>
                <h3 className="font-bold text-[#171A2B] dark:text-white">1. Select Agency User</h3>
                <p className="mt-1 text-sm text-[#5F667A] dark:text-[#8A90A2]">Search by the user’s name or email address.</p>
              </div>

              {selectedUser ? (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[#FF7817]/40 bg-[#FFF8F2] p-4 dark:bg-[#FF7817]/10">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FF7817] font-bold text-white">{selectedUser.name.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#171A2B] dark:text-white">{selectedUser.name}</p>
                      <p className="truncate text-sm text-[#5F667A] dark:text-[#AEB4C7]">{selectedUser.email}</p>
                    </div>
                  </div>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => { setSelectedUser(null); setUserSearch(''); setIsUserSearchOpen(true); }}
                      className="rounded-lg p-2 text-[#5F667A] hover:bg-white hover:text-rose-600 dark:hover:bg-[#252B5C]"
                      aria-label="Choose a different Agency user"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="search"
                    label="Agency User *"
                    value={userSearch}
                    onChange={event => { setUserSearch(event.target.value); setIsUserSearchOpen(true); setFormError(''); }}
                    onFocus={() => setIsUserSearchOpen(true)}
                    placeholder="Search Agency users by name or email..."
                    leftIcon={<UserRoundSearch className="h-5 w-5" />}
                    autoComplete="off"
                    autoFocus
                  />
                  {isUserSearchOpen && userSearch.trim() && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#D9DDE8] bg-white p-1.5 shadow-xl dark:border-[#252B5C] dark:bg-[#0B1030]">
                      {matchingAgencyUsers.length ? matchingAgencyUsers.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => { setSelectedUser(user); setUserSearch(user.name); setIsUserSearchOpen(false); }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[#FFF1E6] dark:hover:bg-[#252B5C]"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FFF0E4] font-bold text-[#FF7817] dark:bg-[#252B5C]">{user.name.charAt(0).toUpperCase()}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-[#171A2B] dark:text-white">{user.name}</span>
                            <span className="block truncate text-xs text-[#8A90A2]">{user.email}</span>
                          </span>
                        </button>
                      )) : (
                        <p className="px-4 py-5 text-center text-sm text-[#8A90A2]">No Agency users match this search.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-4 border-t border-[#D9DDE8] pt-6 dark:border-[#252B5C]">
              <div>
                <h3 className="font-bold text-[#171A2B] dark:text-white">2. Add Commission Rules</h3>
                <p className="mt-1 text-sm text-[#5F667A] dark:text-[#8A90A2]">Choose a service and enter the percentage this user will receive.</p>
              </div>

              <div className="space-y-3">
                {drafts.map((draft, index) => (
                  <div key={draft.id} className="grid gap-3 rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] p-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end dark:border-[#252B5C] dark:bg-[#0B1030]">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#151A46] text-sm font-bold text-white dark:bg-[#252B5C]">{index + 1}</span>
                    <Select
                      label="Service *"
                      value={draft.service}
                      onChange={event => updateDraft(draft.id, { service: event.target.value as CommissionService | '' })}
                      options={serviceOptions}
                    />
                    <Input
                      type="number"
                      min="0.01"
                      max="100"
                      step="0.01"
                      label="Commission Percentage *"
                      value={draft.percentage}
                      onChange={event => updateDraft(draft.id, { percentage: event.target.value })}
                      placeholder="e.g. 10"
                      rightElement={<span className="font-bold text-[#5F667A]">%</span>}
                    />
                    {!editing && drafts.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeDraft(draft.id)}
                        className="grid h-11 w-11 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        aria-label={`Remove commission rule ${index + 1}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    ) : <span className="hidden h-11 w-11 sm:block" />}
                  </div>
                ))}
              </div>

              {!editing && (
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={addDraft}
                  disabled={drafts.length >= services.length}
                >
                  Add Another Commission
                </Button>
              )}
            </section>

            {formError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{formError}</p>}

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#D9DDE8] pt-5 sm:flex-row dark:border-[#252B5C]">
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Cancel</Button>
              <Button type="submit" variant="accent" size="lg" isLoading={isSaving} leftIcon={<BadgePercent className="h-5 w-5" />}>
                {editing ? 'Save Changes' : 'Submit Commissions'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commissions"
        subtitle="Assign and manage service commission percentages for Agency users."
        action={isAdmin ? <Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>Add Commission</Button> : undefined}
      />

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="flex flex-col gap-4 border-b border-[#D9DDE8] p-5 lg:flex-row lg:items-end dark:border-[#252B5C]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90A2]" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search by Agency user, email, or service..."
              className="h-11 w-full rounded-lg border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white"
            />
          </div>
          <Select
            label="Service"
            value={serviceFilter}
            onChange={event => setServiceFilter(event.target.value)}
            className="lg:w-52"
            options={[{ value: 'All', label: 'All Services' }, ...services.map(service => ({ value: service, label: service }))]}
          />
          <div className="flex h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
            {filteredCommissions.length} {filteredCommissions.length === 1 ? 'commission' : 'commissions'}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map(index => <div key={index} className="h-16 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />)}</div>
        ) : filteredCommissions.length === 0 ? (
          <EmptyState
            icon={<BadgePercent className="h-8 w-8" />}
            title={search || serviceFilter !== 'All' ? 'No matching commissions' : 'No commissions yet'}
            description={search || serviceFilter !== 'All'
              ? 'Try adjusting your search or service filter.'
              : isAdmin ? 'Assign the first service commission to an Agency user.' : 'No service commissions have been assigned to your account yet.'}
            actionLabel={isAdmin && !search && serviceFilter === 'All' ? 'Add Commission' : undefined}
            onAction={isAdmin && !search && serviceFilter === 'All' ? openCreateForm : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]">
                <tr><th className="px-6 py-4">Agency User</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Service</th><th className="px-6 py-4">Commission</th><th className="px-6 py-4">Added</th>{isAdmin && <th className="px-6 py-4 text-center">Actions</th>}</tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredCommissions.map(commission => (
                  <tr key={commission.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]">
                    <td className="px-6 py-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FFF0E4] font-bold text-[#FF7817] dark:bg-[#252B5C]">{commission.userName.charAt(0).toUpperCase()}</span><span className="font-bold text-[#171A2B] dark:text-white">{commission.userName}</span></div></td>
                    <td className="px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">{commission.userEmail}</td>
                    <td className="px-6 py-5"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0F4C81] dark:bg-blue-500/15 dark:text-blue-300">{commission.service}</span></td>
                    <td className="px-6 py-5"><span className="text-lg font-bold text-[#FF7817]">{commission.percentage}%</span></td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">{new Date(commission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    {isAdmin && <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => openEditForm(commission)} className="grid h-9 w-9 place-items-center rounded-lg text-[#5F667A] hover:bg-[#FFF0E4] hover:text-[#FF7817] dark:text-[#AEB4C7] dark:hover:bg-[#252B5C]" aria-label={`Edit ${commission.service} commission for ${commission.userName}`} title="Edit Commission"><Edit3 className="h-4.5 w-4.5" /></button>
                        <button type="button" onClick={() => setDeleting(commission)} className="grid h-9 w-9 place-items-center rounded-lg text-[#5F667A] hover:bg-rose-50 hover:text-rose-600 dark:text-[#AEB4C7] dark:hover:bg-rose-950/30" aria-label={`Delete ${commission.service} commission for ${commission.userName}`} title="Delete Commission"><Trash2 className="h-4.5 w-4.5" /></button>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Commission"
        message={`Delete the ${deleting?.service || ''} commission for ${deleting?.userName || 'this Agency user'}?`}
        confirmText="Delete Commission"
        isLoading={isSaving}
      />
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Agency } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export const AgenciesAdminPage: React.FC = () => {
  const { showToast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [verifiedFilter, setVerifiedFilter] = useState('All');

  // Modals
  const [viewAgency, setViewAgency] = useState<Agency | null>(null);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    country: '',
    city: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    verified: true,
    logo: '',
  });

  const loadAgencies = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAgencies();
      setAgencies(data);
    } catch (err: any) {
      showToast('Failed to load agencies directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    agencies.forEach((a) => {
      if (a.country && a.city) set.add(`${a.country} · ${a.city}`);
      else if (a.country) set.add(a.country);
    });
    return Array.from(set).sort();
  }, [agencies]);

  const filteredAgencies = useMemo(() => {
    return agencies.filter((a) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          a.name.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.contactName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (locationFilter !== 'All') {
        const loc = `${a.country} · ${a.city}`;
        if (loc !== locationFilter && a.country !== locationFilter) return false;
      }
      if (verifiedFilter === 'Verified' && !a.verified) return false;
      if (verifiedFilter === 'Unverified' && a.verified) return false;
      return true;
    });
  }, [agencies, search, locationFilter, verifiedFilter]);

  const handleOpenAdd = () => {
    setEditingAgency(null);
    setFormState({
      name: '',
      country: '',
      city: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      verified: true,
      logo: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (a: Agency) => {
    setEditingAgency(a);
    setFormState({
      name: a.name,
      country: a.country,
      city: a.city,
      contactName: a.contactName,
      email: a.email,
      phone: a.phone || '',
      website: a.website || '',
      address: a.address || '',
      verified: a.verified,
      logo: a.logo || '',
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.country.trim() || !formState.city.trim() || !formState.contactName.trim() || !formState.email.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      if (editingAgency) {
        const updated = await api.updateAgency(editingAgency.id, formState);
        setAgencies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast(`Agency "${updated.name}" updated successfully.`, 'success');
      } else {
        const created = await api.createAgency(formState);
        setAgencies((prev) => [created, ...prev]);
        showToast(`Agency "${created.name}" created successfully.`, 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVerified = async (agency: Agency) => {
    try {
      const updated = await api.updateAgency(agency.id, { verified: !agency.verified });
      setAgencies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(
        `Agency status updated: ${updated.verified ? 'Verified' : 'Pending Verification'}`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to update verification status.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteAgency(deleteTarget.id);
      setAgencies((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(`Agency "${deleteTarget.name}" deleted successfully.`, 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete agency.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agencies Management"
        subtitle="Oversee verified international partner agencies, contact persons, and compliance credentials on file."
        action={
          <Button onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Add Agency
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-6">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, contact, email, or country..."
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Regions / Cities' },
                ...locationOptions.map((loc) => ({ value: loc, label: loc })),
              ]}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Verified', label: 'Verified Only' },
                { value: 'Unverified', label: 'Pending Verification' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Agencies Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#202754] bg-gray-50/70 dark:bg-[#151A46]/50 text-[#6B7280] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Agency</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">On File Since</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#202754]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                    Loading agencies...
                  </td>
                </tr>
              ) : filteredAgencies.length > 0 ? (
                filteredAgencies.map((agency) => (
                  <tr
                    key={agency.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center p-[2px] border border-[#FF7817] shrink-0 bg-white dark:bg-[#151A46]">
                          <div className="w-full h-full rounded-full border border-dashed border-[#FF7817]/60 flex items-center justify-center bg-[#FF7817]/5 dark:bg-[#0B1030] overflow-hidden">
                            {agency.logo ? (
                              <img
                                src={agency.logo}
                                alt={agency.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-light text-[#0F1F4D] dark:text-white uppercase">
                                {agency.name.trim().charAt(0) || 'A'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-[#0F1F4D] dark:text-white">
                            {agency.name}
                          </div>
                          {agency.website && (
                            <a
                              href={
                                agency.website.startsWith('http')
                                  ? agency.website
                                  : `https://${agency.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#3B63E0] hover:underline"
                            >
                              Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[#3B63E0] font-medium text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {agency.country} · {agency.city}
                        </span>
                      </div>
                      {agency.address && (
                        <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                          {agency.address}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#0F1F4D] dark:text-white">
                        {agency.contactName}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">{agency.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleVerified(agency)}
                        title="Click to toggle status"
                        className="cursor-pointer"
                      >
                        {agency.verified ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F1EB] border border-[#A9D3C0] text-[#1F7A55] text-[10px] font-bold tracking-wider uppercase select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A55]" />
                            <span>VERIFIED</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 dark:text-amber-300 text-[10px] font-bold tracking-wider uppercase select-none">
                            <span>PENDING</span>
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#FF7817]">
                      {new Date(agency.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewAgency(agency)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#0F1F4D] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(agency)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-white/10"
                          title="Edit Agency"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(agency)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-white/10"
                          title="Delete Agency"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B7280]">
                    No agencies match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !isSaving && setIsFormOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#111638] border border-gray-200/80 dark:border-[#202754] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202754] pb-3">
              <h2 className="font-heading text-lg font-bold text-[#0F1F4D] dark:text-white">
                {editingAgency ? 'Edit Agency' : 'Add New Agency'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                  Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.country}
                    onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.contactName}
                    onChange={(e) => setFormState({ ...formState, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formState.website}
                    onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F1F4D] dark:text-slate-200 mb-1">
                  Office Address
                </label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#202754] bg-[#F8F9FC] dark:bg-[#0B1030] text-xs sm:text-sm text-[#0F1F4D] dark:text-white focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="admin-verified"
                  checked={formState.verified}
                  onChange={(e) => setFormState({ ...formState, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1F7A55] focus:ring-[#1F7A55]"
                />
                <label htmlFor="admin-verified" className="text-xs font-medium text-[#0F1F4D] dark:text-slate-200 cursor-pointer">
                  Mark as Verified Agency (Display verified green badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#202754]">
                <Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingAgency ? 'Update Agency' : 'Create Agency'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewAgency && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewAgency(null)}
        >
          <div
            className="bg-white dark:bg-[#111638] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center p-[2px] border border-[#FF7817] shrink-0 bg-white dark:bg-[#151A46]">
                  <div className="w-full h-full rounded-full border border-dashed border-[#FF7817]/60 flex items-center justify-center bg-[#FF7817]/5 dark:bg-[#0B1030] overflow-hidden">
                    <span className="text-lg font-light text-[#0F1F4D] dark:text-white uppercase">
                      {viewAgency.name.trim().charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#0F1F4D] dark:text-white">
                    {viewAgency.name}
                  </h3>
                  <div className="text-xs text-[#3B63E0]">
                    {viewAgency.country} · {viewAgency.city}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewAgency(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#0F1F4D] dark:text-slate-200 border-t border-b border-gray-100 dark:border-[#202754] py-3">
              <div>
                <span className="text-gray-400 block text-[10px]">Contact Person:</span>
                <span className="font-medium">{viewAgency.contactName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Email:</span>
                <span className="font-medium">{viewAgency.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Phone:</span>
                <span className="font-medium">{viewAgency.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Website:</span>
                <span className="font-medium">{viewAgency.website || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Address:</span>
                <span>{viewAgency.address || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewAgency(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Agency"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the agencies directory? This action cannot be undone.`}
        confirmText="Delete Agency"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

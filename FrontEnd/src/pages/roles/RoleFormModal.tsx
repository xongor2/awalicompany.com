import React, { FormEvent, useEffect, useState } from 'react';
import { Check, LayoutDashboard, Building2, ShieldCheck, Newspaper, Users, KeyRound, User, HeartPulse, Handshake, GraduationCap, Settings } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { RoleDefinition } from '../../types';

export const ROLE_PAGES = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview and reporting', icon: LayoutDashboard },
  { id: 'health', label: 'Health', description: 'Health services and records', icon: HeartPulse },
  { id: 'education', label: 'Education', description: 'Education programs and student records', icon: GraduationCap },
  { id: 'properties', label: 'Properties', description: 'Property listings and details', icon: Building2 },
  { id: 'services', label: 'Consulting', description: 'Consulting service management', icon: Handshake },
  { id: 'agencies', label: 'Agencies', description: 'Partner agency directory', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', description: 'System preferences and configuration', icon: Settings },
  { id: 'blogs', label: 'Blogs', description: 'Articles and categories', icon: Newspaper },
  { id: 'users', label: 'Users', description: 'User account management', icon: Users },
  { id: 'roles', label: 'Roles', description: 'Roles and page permissions', icon: KeyRound },
  { id: 'profile', label: 'Profile', description: 'Personal account settings', icon: User },
] as const;

interface RoleFormModalProps {
  isOpen: boolean;
  role?: RoleDefinition | null;
  onClose: () => void;
  onSubmit: (data: Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>) => Promise<void>;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, role, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pageAccess, setPageAccess] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(role?.name || '');
    setDescription(role?.description || '');
    setPageAccess(role?.pageAccess || []);
    setError('');
  }, [isOpen, role]);

  const togglePage = (pageId: string) => {
    setPageAccess(current =>
      current.includes(pageId) ? current.filter(item => item !== pageId) : [...current, pageId]
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }
    if (pageAccess.length === 0) {
      setError('Select at least one page for this role.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), pageAccess });
      onClose();
    } catch (submissionError: any) {
      setError(submissionError.message || 'Unable to save this role.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? `Edit ${role.type} Role` : 'Create Custom Role'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="role-type" className="block text-sm font-bold text-[#171A2B] dark:text-white">
            Role Type
          </label>
          <select
            id="role-type"
            disabled
            value={role ? `${role.type} Role` : 'Custom Role'}
            className="w-full h-12 px-4 rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] text-[#5F667A] dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-[#D9DDE8]"
          >
            <option>{role ? `${role.type} Role` : 'Custom Role'}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="role-name" className="block text-sm font-bold text-[#171A2B] dark:text-white">
            Role Name <span className="text-[#FF7817]">*</span>
          </label>
          <input
            id="role-name"
            value={name}
            onChange={event => setName(event.target.value)}
            readOnly={role?.type === 'System'}
            placeholder="e.g. Property Coordinator"
            autoFocus
            className="w-full h-12 px-4 rounded-xl border border-[#D9DDE8] bg-white text-[#171A2B] placeholder:text-[#8A90A2] focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/15 focus:outline-none read-only:bg-[#F8F9FC] read-only:text-[#5F667A] dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white dark:read-only:bg-[#151A46]"
          />
          {role?.type === 'System' ? (
            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2]">
              The system role name stays fixed, while its description and page-access rules can be changed.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="role-description" className="block text-sm font-bold text-[#171A2B] dark:text-white">
            Description
          </label>
          <textarea
            id="role-description"
            rows={4}
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="What is this role responsible for?"
            className="w-full px-4 py-3 rounded-xl border border-[#D9DDE8] bg-white text-[#171A2B] placeholder:text-[#8A90A2] focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/15 focus:outline-none resize-y dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-lg font-bold text-[#151A46] dark:text-white">Page Access</legend>
          <p className="text-sm text-[#5F667A] dark:text-[#8A90A2]">
            Check every page this role is allowed to open.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {ROLE_PAGES.map(page => {
              const Icon = page.icon;
              const isSelected = pageAccess.includes(page.id);
              return (
                <label
                  key={page.id}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FF7817] bg-[#FFF6EF] dark:bg-[#FF7817]/10'
                      : 'border-[#D9DDE8] hover:border-[#FF7817]/50 dark:border-[#252B5C] dark:hover:border-[#FF7817]/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePage(page.id)}
                    className="sr-only"
                  />
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${isSelected ? 'bg-[#FF7817] text-white' : 'bg-[#EEF0F5] text-[#151A46] dark:bg-[#252B5C] dark:text-[#D9DDE8]'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#171A2B] dark:text-white">{page.label}</span>
                    <span className="block text-[11px] text-[#8A90A2]">{page.description}</span>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${isSelected ? 'border-[#FF7817] bg-[#FF7817] text-white' : 'border-[#C5CBE0] dark:border-[#5F667A]'}`}>
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="accent" isLoading={isSaving}>
            {role ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

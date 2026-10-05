import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, KeyRound, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { RoleDefinition } from '../../types';
import { ROLE_PAGES, RoleFormModal } from './RoleFormModal';

const StatCard: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <Card className="shadow-none">
    <div className="flex items-center gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FF7817]/10 text-[#FF7817]">{icon}</div>
      <div>
        <p className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5F667A] dark:text-[#8A90A2]">{label}</p>
      </div>
    </div>
  </Card>
);

export const RolesPage: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      setRoles(await api.getRoles());
    } catch (error: any) {
      showToast(error.message || 'Failed to load roles.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const stats = useMemo(() => ({
    total: roles.length,
    custom: roles.filter(role => role.type === 'Custom').length,
    users: roles.reduce((total, role) => total + (role.userCount || 0), 0)
  }), [roles]);

  const handleSave = async (data: Pick<RoleDefinition, 'name' | 'description' | 'pageAccess'>) => {
    if (editingRole) {
      await api.updateRole(editingRole.id, data);
      showToast('Role permissions updated successfully.', 'success');
    } else {
      await api.createRole(data);
      showToast('Custom role created successfully.', 'success');
    }
    await loadRoles();
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      await api.deleteRole(deletingRole.id);
      showToast('Custom role deleted successfully.', 'success');
      setDeletingRole(null);
      await loadRoles();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete role.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Types & Access"
        subtitle="Assign portal responsibilities and page-level permissions."
        action={
          <Button
            variant="accent"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingRole(null);
              setIsFormOpen(true);
            }}
          >
            Custom Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} value={stats.total} label="Total Roles" />
        <StatCard icon={<KeyRound className="h-5 w-5" />} value={stats.custom} label="Custom Roles" />
        <StatCard icon={<Users className="h-5 w-5" />} value={stats.users} label="Assigned Users" />
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : roles.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-8 w-8" />}
              title="No roles configured"
              description="Create a custom role to define page-level access."
              actionLabel="Create Role"
              onAction={() => setIsFormOpen(true)}
            />
          ) : (
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#D9DDE8] bg-[#F8F9FC] font-semibold uppercase tracking-wide text-[#5F667A] dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-[#8A90A2]">
                  <th className="px-6 py-4">Role</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Page Access</th>
                  <th className="px-4 py-4">Users</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C]">
                {roles.map(role => (
                  <tr key={role.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#252B5C]/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF7817]/10 text-[#FF7817]">
                          <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#151A46] dark:text-white">{role.name}</p>
                          <p className="mt-0.5 max-w-sm text-[11px] text-[#8A90A2]">{role.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${role.type === 'Custom' ? 'bg-[#FF7817]/10 text-[#D95D00]' : 'bg-[#151A46]/10 text-[#151A46] dark:bg-white/10 dark:text-white'}`}>
                        {role.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#171A2B] dark:text-[#D9DDE8]">
                      {role.pageAccess.length} of {ROLE_PAGES.length} pages
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#171A2B] dark:text-[#D9DDE8]">{role.userCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      {role.type === 'Custom' ? (
                        <ActionMenu actions={[
                          {
                            label: 'Edit Role',
                            icon: <Edit2 className="h-4 w-4 text-[#FF7817]" />,
                            onClick: () => {
                              setEditingRole(role);
                              setIsFormOpen(true);
                            }
                          },
                          {
                            label: 'Delete Role',
                            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
                            onClick: () => setDeletingRole(role),
                            variant: 'danger'
                          }
                        ]} />
                      ) : (
                        <span className="text-[11px] font-medium text-[#8A90A2]">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <RoleFormModal
        isOpen={isFormOpen}
        role={editingRole}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Custom Role"
        message={`Delete “${deletingRole?.name || ''}”? Users assigned to this role should be moved to another role first.`}
      />
    </div>
  );
};

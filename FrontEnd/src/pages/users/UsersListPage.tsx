import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Users,
  Eye,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Pagination } from '../../components/ui/Pagination';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { UserDetailModal } from './UserDetailModal';
import { UserFormModal } from './UserFormModal';
import { User } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

interface UsersListPageProps {
  initialSearch?: string;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  selectedUser?: User | null;
  onClearSelectedUser?: () => void;
}

export const UsersListPage: React.FC<UsersListPageProps> = ({
  initialSearch = '',
  isAddModalOpen = false,
  onCloseAddModal,
  selectedUser,
  onClearSelectedUser,
}) => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(selectedUser || null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAddModalOpen) setIsFormOpen(true);
  }, [isAddModalOpen]);

  useEffect(() => {
    if (selectedUser) setViewUser(selectedUser);
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers({
        search: search || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage, pageSize]);

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || roleFilter !== 'All' || statusFilter !== 'All';

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(deleteUser.id);
      showToast('User account removed successfully.', 'success');
      setDeleteUser(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Registered System Users"
        subtitle="Manage administrative members, real estate agents, and authorized clients"
        action={
          currentUser?.role === 'Admin' ? (
            <Button
              variant="accent"
              onClick={() => {
                setUserToEdit(null);
                setIsFormOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add User
            </Button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar Card */}
      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC]/50 dark:bg-[#0B1030]/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search user by name or email..."
              width="w-full sm:w-72"
            />

            <div className="w-full sm:w-40">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Roles' },
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Agent', label: 'Agent' },
                  { value: 'Client', label: 'Client' },
                ]}
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FF7817] hover:bg-[#FFF0E4] dark:hover:bg-[#252B5C] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No users match search"
              description="Try adjusting your role or status filters to locate registered accounts."
              actionLabel="Reset Search"
              onAction={resetFilters}
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#5F667A] dark:text-[#8A90A2] font-semibold">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C]">
                {paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[#EEF0F5]/50 dark:hover:bg-[#252B5C]/30 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profile_image} name={u.name} size="md" />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setViewUser(u)}
                            className="font-bold text-sm text-[#171A2B] dark:text-white truncate block hover:text-[#FF7817] cursor-pointer text-left"
                          >
                            {u.name}
                          </button>
                          <span className="text-[11px] text-[#8A90A2] block">
                            {u.phone || 'Phone: N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#171A2B] dark:text-[#D9DDE8]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role.toLowerCase() as any}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.status === 'Active'
                            ? 'active'
                            : u.status === 'Pending'
                            ? 'pending'
                            : 'inactive'
                        }
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#8A90A2] whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <ActionMenu
                        actions={[
                          {
                            label: 'View Profile',
                            icon: <Eye className="w-4 h-4 text-blue-500" />,
                            onClick: () => setViewUser(u),
                          },
                          {
                            label: 'Edit User',
                            icon: <Edit2 className="w-4 h-4 text-[#FF7817]" />,
                            onClick: () => {
                              setUserToEdit(u);
                              setIsFormOpen(true);
                            },
                          },
                          ...(currentUser?.role === 'Admin' && u.id !== currentUser.id
                            ? [
                                {
                                  label: 'Delete User',
                                  icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                                  onClick: () => setDeleteUser(u),
                                  variant: 'danger' as const,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {users.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setUserToEdit(null);
          if (onCloseAddModal) onCloseAddModal();
        }}
        onSuccess={loadUsers}
        userToEdit={userToEdit}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={viewUser}
        isOpen={!!viewUser}
        onClose={() => {
          setViewUser(null);
          if (onClearSelectedUser) onClearSelectedUser();
        }}
        onEdit={(u) => {
          setUserToEdit(u);
          setIsFormOpen(true);
        }}
        onDelete={(u) => setDeleteUser(u)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${deleteUser?.name}" (${deleteUser?.email})?`}
      />
    </div>
  );
};

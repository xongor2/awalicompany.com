import React from 'react';
import { Mail, Phone, Shield, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { User } from '../../types';
import { isProtectedUser } from '../../utils/protectedUsers';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!user) return null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Account Profile" maxWidth="md">
      <div className="space-y-6">
        {/* Header with Avatar & Badge */}
        <div className="flex items-center gap-4">
          <Avatar src={user.profile_image} name={user.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-heading text-lg font-bold text-[#171A2B] dark:text-white truncate">
                {user.name}
              </h2>
              <Badge variant={user.role.toLowerCase() as any}>{user.role}</Badge>
            </div>
            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] truncate">{user.email}</p>
            <div className="mt-2">
              <Badge
                variant={
                  user.status === 'Active'
                    ? 'active'
                    : user.status === 'Pending'
                    ? 'pending'
                    : 'inactive'
                }
              >
                {user.status} Account
              </Badge>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 gap-3 p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#D9DDE8] dark:border-[#252B5C]">
            <span className="text-[#8A90A2] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>Email Address</span>
            </span>
            <span className="font-semibold text-[#171A2B] dark:text-white">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#D9DDE8] dark:border-[#252B5C]">
            <span className="text-[#8A90A2] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>Assigned Role</span>
            </span>
            <span className="font-semibold text-[#171A2B] dark:text-white">{user.role}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#D9DDE8] dark:border-[#252B5C]">
            <span className="text-[#8A90A2] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>Direct Phone</span>
            </span>
            <span className="font-semibold text-[#171A2B] dark:text-white">
              {user.phone || 'Not provided'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#8A90A2] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>Registered On</span>
            </span>
            <span className="font-semibold text-[#171A2B] dark:text-white">
              {formatDate(user.created_at)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!isProtectedUser(user) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(user);
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete User
            </Button>
          )}
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

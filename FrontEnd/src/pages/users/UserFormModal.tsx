import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { NATURE_AVATARS } from '../../constants/natureAvatars';
import { AvatarPicker } from '../../components/common/AvatarPicker';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: User | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}) => {
  const { showToast } = useToast();
  const isEdit = !!userToEdit;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Agent' | 'Client'>('Agent');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Inactive'>('Active');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string>(NATURE_AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setPassword('');
      setRole(userToEdit.role);
      setStatus(userToEdit.status);
      setPhone(userToEdit.phone || '');
      setProfileImage(userToEdit.profile_image || NATURE_AVATARS[0]);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Agent');
      setStatus('Active');
      setPhone('+252 61 ');
      setProfileImage(NATURE_AVATARS[0]);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Please provide full name and valid email.');
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && userToEdit) {
        await api.updateUser(userToEdit.id, {
          name: name.trim(),
          email: email.trim(),
          role,
          status,
          phone: phone.trim(),
          profile_image: profileImage,
        });
        showToast('User account updated successfully.', 'success');
      } else {
        await api.createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          status,
          phone: phone.trim(),
          profile_image: profileImage,
        });
        showToast('New user account created successfully.', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User Information' : 'Register New System User'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Full Name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Khan"
        />

        <Input
          label="Email Address *"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sarah.khan@awali.com"
        />

        {!isEdit && (
          <Input
            label="Initial Password *"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            helperText="The user can change this upon logging into their profile."
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="System Role *"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: 'Admin', label: 'Admin (Full Access)' },
                { value: 'Agent', label: 'Agent (Manager)' },
                { value: 'Client', label: 'Client / Customer' },
              ]}
            />
          </div>

          <div>
            <Select
              label="Account Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'Active', label: 'Active Account' },
                { value: 'Pending', label: 'Pending Verification' },
                { value: 'Inactive', label: 'Suspended / Inactive' },
              ]}
            />
          </div>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+252 61 329 5050"
        />

        <AvatarPicker label="Profile Avatar Image" value={profileImage} onChange={setProfileImage} />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9DDE8] dark:border-[#252B5C]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Shield,
  Palette,
  CheckCircle2,
  Save,
  Calendar
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { NATURE_AVATARS } from '../../constants/natureAvatars';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setProfileImage(user.profile_image || NATURE_AVATARS[0]);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!name.trim() || !email.trim()) {
      setProfileError('Full name and email are required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profile_image: profileImage,
      });
      await refreshUser();
      showToast('Profile information updated successfully.', 'success');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please enter your current and new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Recent';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Profile & Account Settings"
        subtitle="Manage your administrative credentials, security preferences, and interface theme"
      />

      {/* User Identity Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar src={profileImage} name={name || 'User'} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="font-heading text-xl font-bold text-[#171A2B] dark:text-white">
                {user?.name}
              </h2>
              <Badge variant={user?.role.toLowerCase() as any}>{user?.role || 'User'}</Badge>
              <Badge variant={user?.status === 'Active' ? 'active' : 'pending'}>
                {user?.status || 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] mb-3">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#8A90A2]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF7817]" />
                <span>Joined {formatDate(user?.created_at)}</span>
              </span>
              <span>Account ID: {user?.id}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Profile Details */}
        <Card title="Personal Information">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {profileError}
              </div>
            )}

            <Input
              label="Full Name *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed Ali"
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@awali.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Direct Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+252 61 329 5050"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            {/* Profile Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8] mb-1.5">
                Profile Avatar
              </label>
              <Input
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[#8A90A2]">Presets:</span>
                {NATURE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProfileImage(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      profileImage === url
                        ? 'border-[#FF7817] scale-110 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Nature preset ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              isLoading={isSavingProfile}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Change Password & Security */}
        <div className="space-y-6">
          <Card title="Change Password">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {passwordError}
                </div>
              )}

              <Input
                label="Current Password *"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="New Password *"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                leftIcon={<Shield className="w-4 h-4" />}
              />

              <Input
                label="Confirm New Password *"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                leftIcon={<Shield className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isSavingPassword}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full mt-2"
              >
                Update Password
              </Button>
            </form>
          </Card>

          {/* Theme Preferences (Section 9 of Spec) */}
          <Card title="Interface Theme Preference">
            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] mb-4">
              Select your preferred visual appearance. Changes persist across browser sessions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-[#FF7817] bg-[#FFF0E4]/50 dark:bg-[#252B5C] ring-2 ring-[#FF7817]/20 font-bold'
                    : 'border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#5F667A] dark:text-[#8A90A2]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#171A2B] dark:text-white">Light Mode</span>
                  <div className="w-4 h-4 rounded-full border border-[#D9DDE8] bg-[#F8F9FC]" />
                </div>
                <p className="text-[11px] text-[#5F667A] dark:text-[#8A90A2]">
                  Soft white canvas with navy sidebar and high-contrast text
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[#FF7817] bg-[#FFF0E4]/50 dark:bg-[#252B5C] ring-2 ring-[#FF7817]/20 font-bold'
                    : 'border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#5F667A] dark:text-[#8A90A2]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#171A2B] dark:text-white">Dark Mode</span>
                  <div className="w-4 h-4 rounded-full border border-[#252B5C] bg-[#0B1030]" />
                </div>
                <p className="text-[11px] text-[#5F667A] dark:text-[#8A90A2]">
                  Deep navy canvas with glowing orange accents
                </p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

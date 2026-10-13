import React, { useState } from 'react';
import { Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const SignUpPage: React.FC<{
  onSwitchToLogin: () => void;
  onBackToWebsite?: () => void;
}> = ({ onSwitchToLogin, onBackToWebsite }) => {
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register({ name, email, password, confirmPassword });
      showToast('Registration successful! Welcome to AW Ali Company.', 'success');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FC] dark:bg-[#0B1030] transition-colors relative">
      <div className="absolute top-6 left-6">
        {onBackToWebsite && (
          <button
            type="button"
            onClick={onBackToWebsite}
            className="text-xs font-semibold text-[#5F667A] dark:text-[#AAB2CA] hover:text-[#FF7817] flex items-center gap-1.5 transition-colors"
          >
            ← Return to Public Website
          </button>
        )}
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#151A46] rounded-2xl shadow-md">
            <BrandLogo />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold font-heading tracking-tight text-[#171A2B] dark:text-white">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-[#5F667A] dark:text-[#8A90A2]">
          Join the AW Ali Company management portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#151A46] py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-[#D9DDE8] dark:border-[#252B5C]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tariq@awali.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                leftIcon={<Shield className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold mt-2 shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5F667A] dark:text-[#8A90A2]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-[#FF7817] hover:underline"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

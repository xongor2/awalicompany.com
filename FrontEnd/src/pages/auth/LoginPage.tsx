import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const LoginPage: React.FC<{
  onSwitchToSignUp: () => void;
  onBackToWebsite?: () => void;
}> = ({ onSwitchToSignUp, onBackToWebsite }) => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      await login(email, password);
      showToast('Welcome back to AW Ali Company management system!', 'success');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-[#5F667A] dark:text-[#8A90A2]">
          AW Ali Company Centralized Management Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#151A46] py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-[#D9DDE8] dark:border-[#252B5C]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@awali.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#5F667A] dark:text-[#D9DDE8]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D9DDE8] text-[#FF7817] focus:ring-[#FF7817] h-4 w-4"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => showToast('Password reset link sent to registered email address.', 'info')}
                className="font-medium text-[#FF7817] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5F667A] dark:text-[#8A90A2]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-semibold text-[#FF7817] hover:underline"
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

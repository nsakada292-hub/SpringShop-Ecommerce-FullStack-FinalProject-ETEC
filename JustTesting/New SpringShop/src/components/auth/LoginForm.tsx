import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, pass: string) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [email, setEmail] = useState('customer@springshop.com');
  const [password, setPassword] = useState('Password123!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onSubmit(email, password);
    }
  };

  const handleAdminPreset = () => {
    setEmail('admin@springshop.com');
    setPassword('Password123!');
  };

  const handleCustomerPreset = () => {
    setEmail('customer@springshop.com');
    setPassword('Password123!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fast Demo Account Pickers */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleCustomerPreset}
          className="flex-1 py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[11px] font-semibold transition-colors text-center"
        >
          Customer Demo (Dara)
        </button>
        <button
          type="button"
          onClick={handleAdminPreset}
          className="flex-1 py-1.5 px-2 bg-[#00e1ff]/10 hover:bg-[#00e1ff]/20 text-[#009dff] rounded-lg text-[11px] font-semibold transition-colors text-center"
        >
          Admin Staff (Sophea)
        </button>
      </div>

      <div className="relative">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-[#009dff] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-[#009dff] focus:ring-4 focus:ring-[#009dff]/20 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        <span>Continue to Verification</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

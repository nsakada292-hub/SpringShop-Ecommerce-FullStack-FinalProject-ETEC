import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { OtpVerificationForm } from '../../components/auth/OtpVerificationForm';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingRole, setPendingRole] = useState<'USER' | 'ADMIN'>('USER');
  const [demoCode, setDemoCode] = useState('123456');
  const [loading, setLoading] = useState(false);

  const { login, register, verifyOtp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const handleLoginSubmit = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await login(email, pass);
      setPendingEmail(email);
      setDemoCode(res.demoOtp || '123456');
      if (email.includes('admin')) {
        setPendingRole('ADMIN');
      } else {
        setPendingRole('USER');
      }
      setStep('otp');
      success('OTP code sent to your email. Enter 123456 to verify.');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await register(name, email, pass);
      setPendingEmail(email);
      setDemoCode(res.demoOtp || '123456');
      setPendingRole('USER');
      setStep('otp');
      success('Account created! Please enter verification code.');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true);
    try {
      const user = await verifyOtp(pendingEmail, otp);
      success(`Welcome back, ${user.name}!`);

      // Branch by role as specified in spec 3.5:
      if (redirectParam) {
        navigate(redirectParam);
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await login(pendingEmail, 'Password123!');
    success('New code sent: 123456');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-base shadow-sm">
              S
            </div>
            <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              Spring<span className="text-[#009dff]">Shop</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {step === 'otp' ? 'Two-Factor Verification' : activeTab === 'login' ? 'Sign in to SpringShop' : 'Create an Account'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {step === 'otp'
              ? `We sent a 6-digit confirmation code to ${pendingEmail}`
              : activeTab === 'login'
              ? 'Access orders, fast checkout, and love lists'
              : 'Join SpringShop for exclusive member drops'}
          </p>
        </div>

        {/* Tab switcher for login vs register */}
        {step === 'form' && (
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Content Body */}
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'login' ? (
                <LoginForm onSubmit={handleLoginSubmit} isLoading={loading} />
              ) : (
                <RegisterForm onSubmit={handleRegisterSubmit} isLoading={loading} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <OtpVerificationForm
                email={pendingEmail}
                demoOtp={demoCode}
                onSubmit={handleVerifyOtp}
                onResend={handleResendOtp}
                isLoading={loading}
              />
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Lock,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import { OtpInput } from './OtpInput'
import { extractErrorMessage } from './authErrors'
import { cn } from '@/shared/utils/cn'
import springShopLogo from '@/assets/spring-shop-logo.png'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'

const RESEND_SECONDS = 60

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,./]).{8,}$/

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

interface LocationState {
  email?: string
}

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyOtp, sendOtp } = useAuth()

  const stateEmail = (location.state as LocationState | null)?.email ?? ''
  const [email, setEmail] = useState(stateEmail)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const onSubmit = async (_data: ResetPasswordForm) => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }
    setSubmitting(true)
    try {
      await verifyOtp(email, otp)
      toast.success('Code verified successfully!')
      navigate('/sign-in', { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
      setOtp('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }
    setResending(true)
    try {
      const msg = await sendOtp(email)
      toast.success(msg)
      setResendIn(RESEND_SECONDS)
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-4 py-10 dark:bg-[#0a0a0c] sm:px-6">
      <BackgroundSwirl />
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#34d399]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#22c55e]/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <img
            src={springShopLogo}
            alt="SpringShop logo"
            className="h-12 w-auto drop-shadow-md"
          />
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Spring<span className="text-[#22c55e]">Shop</span>
          </span>
        </div>

        <div className="animate-slide-up rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none sm:p-10">
          <div className="mb-6 flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
              <KeyRound className="h-10 w-10" />
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
            Enter the verification code sent to your email and choose a new password.
          </p>

          {!email && (
            <div className="mt-6">
              <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:focus:border-[#34d399]"
                />
              </div>
            </div>
          )}

          {email && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10 px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-[#22c55e] dark:text-[#34d399]" />
              <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                {email}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </span>
              <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={cn(
                    'w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                    errors.password
                      ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                      : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className={cn(
                    'w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                    errors.confirmPassword
                      ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                      : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                  )}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying code...
                </>
              ) : (
                <>
                  Verify & Reset
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-8 flex flex-col items-center gap-2 border-t border-gray-100 pt-6 dark:border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the code?
              {resendIn > 0 ? (
                <span className="font-semibold text-[#22c55e] dark:text-[#34d399]">
                  Resend in {resendIn}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#22c55e] transition-colors hover:text-[#22c55e] disabled:opacity-50 dark:text-[#34d399]"
                >
                  <RefreshCw className={cn('h-4 w-4', resending && 'animate-spin')} />
                  Resend code
                </button>
              )}
            </div>
          </div>

          {/* Info note */}
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e] dark:text-[#34d399]" />
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Once verified, we'll sign you in. On your next sign-in you can change your password
              anytime from your account settings.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle2 className="h-4 w-4" />
          Your account security is important to us
        </div>
      </div>
    </div>
  )
}
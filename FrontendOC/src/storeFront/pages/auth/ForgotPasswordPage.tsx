import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import { extractErrorMessage } from './authErrors'
import { cn } from '@/shared/utils/cn'
import springShopLogo from '@/assets/spring-shop-logo.png'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { sendOtp } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setSubmitting(true)
    try {
      const msg = await sendOtp(data.email)
      toast.success(msg)
      navigate('/reset-password', { state: { email: data.email } })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
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
            Forgot your password?
          </h1>
          <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
            No worries — enter your email and we'll send you a verification code to reset your
            password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                    errors.email
                      ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                      : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                  )}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e] dark:text-[#34d399]" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll send a 6-digit verification code to your inbox. Check your spam folder if you
              don't see it.
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
      </div>
    </div>
  )
}
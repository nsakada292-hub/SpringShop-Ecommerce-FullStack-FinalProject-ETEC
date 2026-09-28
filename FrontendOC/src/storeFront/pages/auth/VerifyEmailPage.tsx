import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Loader2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Headset,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import { OtpInput } from './OtpInput'
import { extractErrorMessage } from './authErrors'
import springShopLogo from '@/assets/spring-shop-logo.png'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'
import { cn } from '@/shared/utils/cn'

const RESEND_SECONDS = 60

interface LocationState {
  email?: string
}

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyOtp, sendOtp } = useAuth()

  const stateEmail = (location.state as LocationState | null)?.email ?? ''
  const [email, setEmail] = useState(stateEmail)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  useEffect(() => {
    if (otp.length === 6 && !verifying) {
      handleVerify(otp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  const handleVerify = async (code: string) => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    setVerifying(true)
    try {
      const verifiedUser = await verifyOtp(email, code)
      toast.success('Email verified successfully!')
      navigate(verifiedUser.role === 'ADMIN' ? '/dashboard' : '/', { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
      setOtp('')
    } finally {
      setVerifying(false)
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
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-64 w-64 rounded-full bg-[#4ce600]/10 blur-3xl" />

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
              <Mail className="h-10 w-10" />
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Verify your email
          </h1>

          {email ? (
            <>
              <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
                We sent a verification code to
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {email}
              </p>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                Enter the 6-digit code below to verify your account.
              </p>
            </>
          ) : (
            <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
              Enter your email to receive a verification code.
            </p>
          )}

          {!email && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleResend()
              }}
              className="mt-6 space-y-3"
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:focus:border-[#34d399]"
                />
              </div>
              <button
                type="submit"
                disabled={resending || !email}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Send code
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8">
            <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
          </div>

          <button
            type="button"
            disabled={verifying || otp.length !== 6}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Verify Account
              </>
            )}
          </button>

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
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Headset className="h-3.5 w-3.5" />
              Need help? Contact our support team anytime.
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]"
            >
              <ArrowLeft className="h-4 w-4" />
              Not this email? Go back to sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle2 className="h-4 w-4" />
          Your code is secure and expires shortly
        </div>
      </div>
    </div>
  )
}

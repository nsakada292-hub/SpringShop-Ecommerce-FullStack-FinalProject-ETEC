import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import springShopLogo from '@/assets/spring-shop-logo.png'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'
import ThreeBackground from '@/shared/components/ThreeBackground'
import { extractErrorMessage } from './authErrors'
import { cn } from '@/shared/utils/cn'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,./]).{8,}$/

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
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

type SignInForm = z.infer<typeof signInSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function SignInPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const signIn = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const regForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role === 'ADMIN') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const onSignIn = async (data: SignInForm) => {
    setSubmitting(true)
    try {
      const msg = await login(data.email, data.password)
      toast.success(msg)
      navigate('/verify-email', { state: { email: data.email } })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setSubmitting(true)
    try {
      const msg = await register(data.name, data.email, data.password)
      toast.success(msg)
      navigate('/verify-email', { state: { email: data.email } })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-[#0a0a0c]">
      <BackgroundSwirl />
      {/* Left panel - gradient brand with 3D animation */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#16a34a] via-[#22c55e] to-[#3cb81a] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <ThreeBackground />
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#4ce600]/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#34d399]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <img
            src={springShopLogo}
            alt="SpringShop logo"
            className="h-12 w-auto drop-shadow-md"
          />
          <span className="text-3xl font-bold tracking-tight text-white">
            Spring<span className="text-white/80">Shop</span>
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="max-w-md text-5xl font-extrabold leading-tight tracking-tight text-white">
            Welcome to SpringShop
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
            Discover premium products curated just for you. Join thousands of happy
            customers shopping smarter, faster, and safer.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShoppingBag, text: 'Shop a curated collection of quality products' },
              { icon: ShieldCheck, text: 'Secure checkout and encrypted payments' },
              { icon: Sparkles, text: 'Fast delivery and easy returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-base font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-white/70">
          <CheckCircle2 className="h-4 w-4" />
          Your privacy and security are our top priority
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img
              src={springShopLogo}
              alt="SpringShop logo"
              className="h-16 w-auto drop-shadow-md"
            />
            <span className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Spring<span className="text-[#22c55e]">Shop</span>
            </span>
          </div>

          {/* Desktop logo */}
          <div className="mb-8 hidden items-center gap-2.5 lg:flex">
            <img
              src={springShopLogo}
              alt="SpringShop logo"
              className="h-11 w-auto drop-shadow-md"
            />
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Spring<span className="text-[#22c55e]">Shop</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {mode === 'signin'
                ? 'Sign in to continue shopping with us.'
                : 'Join SpringShop and start your shopping journey.'}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="mb-8 grid grid-cols-2 rounded-xl bg-surface-100 p-1 dark:bg-surface-800/60">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-surface-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-surface-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Register
            </button>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={signIn.handleSubmit(onSignIn)} className="space-y-5" noValidate>
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
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      signIn.formState.errors.email
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...signIn.register('email')}
                  />
                </div>
                {signIn.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{signIn.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      signIn.formState.errors.password
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...signIn.register('password')}
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
                {signIn.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{signIn.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#22c55e] transition-colors hover:text-[#22c55e] dark:text-[#34d399]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      regForm.formState.errors.name
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...regForm.register('name')}
                  />
                </div>
                {regForm.formState.errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{regForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      regForm.formState.errors.email
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...regForm.register('email')}
                  />
                </div>
                {regForm.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{regForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      regForm.formState.errors.password
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...regForm.register('password')}
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
                {regForm.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{regForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500',
                      regForm.formState.errors.confirmPassword
                        ? 'border-red-400 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-surface-200 focus:border-[#22c55e] focus:ring-[#22c55e]/20 dark:border-surface-700 dark:focus:border-[#34d399]'
                    )}
                    {...regForm.register('confirmPassword')}
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
                {regForm.formState.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">{regForm.formState.errors.confirmPassword.message}</p>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

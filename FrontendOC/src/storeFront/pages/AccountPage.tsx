import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { User as UserIcon, Loader2, Camera, Package, Tag, Copy, Check, ChevronRight, ArrowRight } from 'lucide-react'
import { getInitials, cn } from '@/shared/utils/cn'
import { useAuth } from '@/shared/contexts/AuthContext'
import { usersApi } from '@/shared/api/users.api'
import { newsletterApi } from '@/shared/api/newsletter.api'
import type { Coupon } from '@/shared/types'
import { Input } from '@/shared/components/ui/Input'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .max(30, 'Phone must be at most 30 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(1000, 'Bio must be at most 1000 characters')
    .optional()
    .or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || !isNaN(Date.parse(v + 'T00:00:00')), 'Enter a valid date'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a number')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

const formatDateForInput = (value: string | null | undefined) => {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', bio: '', gender: '', dateOfBirth: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        address: user.address ?? '',
        bio: user.bio ?? '',
        gender: user.gender ?? '',
        dateOfBirth: formatDateForInput(user.dateOfBirth),
      })
      setAvatarPreview(user.avatarUrl ?? null)
    }
  }, [user, profileForm])

  useEffect(() => {
    if (!user) return
    let active = true
    setLoadingCoupons(true)
    newsletterApi
      .getMyCoupons()
      .then(({ data }) => {
        if (active) setCoupons(data)
      })
      .catch(() => {
        if (active) setCoupons([])
      })
      .finally(() => {
        if (active) setLoadingCoupons(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code).catch(() => undefined)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const { data } = await usersApi.uploadAvatar(file)
      toast.success('Profile picture updated')
      await refreshUser()
      setAvatarPreview(data.avatarUrl ?? null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to upload profile picture')
      setAvatarPreview(user?.avatarUrl ?? null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onSaveProfile = async (values: ProfileFormValues) => {
    setSavingProfile(true)
    try {
      await usersApi.updateMe({
        name: values.name,
        email: values.email,
        phone: values.phone ?? undefined,
        address: values.address ?? undefined,
        bio: values.bio ?? undefined,
        gender: values.gender ?? undefined,
        dateOfBirth: values.dateOfBirth || undefined,
      })
      toast.success('Profile updated')
      await refreshUser()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (values: PasswordFormValues) => {
    setSavingPassword(true)
    try {
      await usersApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const newPassword = passwordForm.watch('newPassword') ?? ''

  const textAreaClass =
    'w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua border-surface-200 dark:border-surface-700'

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        <UserIcon className="h-8 w-8 text-[#22c55e] dark:text-[#34d399]" />
        My Account
      </h1>

      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/5">
        <div className="relative shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover shadow-lg shadow-[#22c55e]/25 ring-2 ring-[#34d399]"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399] to-[#22c55e] text-xl font-bold text-white shadow-lg shadow-[#22c55e]/25">
              {user ? getInitials(user.name) : 'AD'}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label="Upload profile picture"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
          >
            {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
            {user?.name ?? 'Customer'}
          </p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email ?? '-'}</p>
          <span className="mt-1.5 inline-flex items-center rounded-full bg-[#34d399]/15 px-2.5 py-0.5 text-xs font-semibold text-[#22c55e] dark:text-[#34d399]">
            {user?.role ?? 'USER'}
          </span>
        </div>
      </div>

      <Link
        to="/orders"
        className="group mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-200/40 dark:bg-white/5 dark:ring-white/5 dark:hover:shadow-black/30"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">My Orders</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              View your order history and track status
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 group-hover:brightness-110 sm:inline-flex">
          View orders
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
        <ChevronRight className="h-5 w-5 text-gray-400 sm:hidden" />
      </Link>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/5">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <Tag className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" />
          My Promo Codes
        </h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Coupons you earned, for example by joining our mailing list.
        </p>

        {loadingCoupons ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading promo codes...
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500 dark:border-surface-700 dark:bg-surface-900/40">
            No promo codes yet. Subscribe to our newsletter to get 10% off your first order.
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const remaining = coupon.maxUsages - coupon.usedCount
              const active =
                !coupon.used &&
                remaining > 0 &&
                (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())
              return (
                <div
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-surface-700/60 dark:bg-surface-900/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold tracking-wider text-[#16a34a] dark:text-[#34d399]">
                        {coupon.code}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          active
                            ? 'bg-[#34d399]/15 text-[#16a34a] dark:text-[#34d399]'
                            : 'bg-gray-200 text-gray-500 dark:bg-surface-700 dark:text-gray-400'
                        )}
                      >
                        {active
                          ? `Active · ${coupon.discountPercent}% off`
                          : coupon.used || remaining <= 0
                            ? 'Fully used'
                            : 'Expired'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {active
                        ? `Valid until ${formatDate(coupon.expiresAt)} · ${remaining} of ${coupon.maxUsages} products left`
                        : coupon.used || remaining <= 0
                          ? `Used on ${formatDate(coupon.usedAt)}`
                          : `Expired on ${formatDate(coupon.expiresAt)}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCode(coupon.code)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95',
                      copiedCode === coupon.code
                        ? 'bg-[#16a34a] text-white'
                        : 'bg-gradient-to-r from-[#34d399] to-[#22c55e] text-white hover:brightness-110'
                    )}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy code
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/5 lg:col-span-2">
          <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
          <form
            onSubmit={(e) => {
              void profileForm.handleSubmit(onSaveProfile)(e)
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Input
              label="Name"
              {...profileForm.register('name')}
              error={profileForm.formState.errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              {...profileForm.register('email')}
              error={profileForm.formState.errors.email?.message}
            />
            <Input
              label="Phone"
              type="tel"
              {...profileForm.register('phone')}
              placeholder="+60 12-345 6789"
              error={profileForm.formState.errors.phone?.message}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...profileForm.register('dateOfBirth')}
              error={profileForm.formState.errors.dateOfBirth?.message}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Gender
              </label>
              <select
                {...profileForm.register('gender')}
                className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua border-surface-200 dark:border-surface-700"
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Address
              </label>
              <textarea
                {...profileForm.register('address')}
                rows={3}
                placeholder="Street, city, state, postal code, country"
                className={cn(textAreaClass, 'resize-none')}
              />
              {profileForm.formState.errors.address?.message && (
                <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.address.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Bio / About me
              </label>
              <textarea
                {...profileForm.register('bio')}
                rows={3}
                placeholder="Tell us a bit about yourself..."
                className={cn(textAreaClass, 'resize-none')}
              />
              {profileForm.formState.errors.bio?.message && (
                <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.bio.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/5">
          <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">Change Password</h2>
          <form
            onSubmit={(e) => {
              void passwordForm.handleSubmit(onChangePassword)(e)
            }}
            className="space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              {...passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <Input
              label="New Password"
              type="password"
              {...passwordForm.register('newPassword')}
              onChange={(e) => {
                passwordForm.setValue('newPassword', e.target.value, { shouldValidate: true })
              }}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <Input
              label="Confirm New Password"
              type="password"
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />
            {newPassword && (
              <div className="space-y-1.5 py-2">
                {passwordChecks.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        c.test(newPassword) ? 'bg-[#22c55e]' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                    <span className={c.test(newPassword) ? 'text-[#22c55e]' : 'text-gray-500 dark:text-gray-400'}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
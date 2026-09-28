import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Camera, Loader2, ShoppingCart, ChevronRight } from 'lucide-react'
import { getInitials, cn } from '@/shared/utils/cn'
import { useAuth } from '@/shared/contexts/AuthContext'
import { usersApi } from '@/shared/api/users.api'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Badge } from '@/shared/components/ui/Badge'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().max(30, 'Phone must be at most 30 characters').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must be at most 500 characters').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')).refine((v) => !v || !isNaN(Date.parse(v + 'T00:00:00')), 'Enter a valid date'),
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

export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Account</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage your profile and security</p>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-aqua"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-bold text-white">
                {user ? getInitials(user.name) : 'AD'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Upload profile picture"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
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
          <div>
            <p className="text-lg font-bold text-surface-900 dark:text-white">{user?.name ?? 'Admin'}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email ?? '-'}</p>
            <div className="mt-1.5">
              {user?.role === 'ADMIN' ? (
                <Badge variant="info">ADMIN</Badge>
              ) : (
                <Badge>USER</Badge>
              )}
            </div>
          </div>
          <Link
            to="/dashboard/orders"
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-surface-100 dark:bg-surface-800 px-4 py-2.5 text-sm font-semibold text-surface-900 dark:text-surface-100 transition-all duration-200 hover:bg-surface-200 dark:hover:bg-surface-700"
          >
            <ShoppingCart size={16} />
            Orders
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <h2 className="mb-5 text-base font-semibold text-surface-900 dark:text-white">Edit Profile</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
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
            <div>
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
            <div>
              <Button type="submit" isLoading={savingProfile}>Save Changes</Button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <h2 className="mb-5 text-base font-semibold text-surface-900 dark:text-white">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
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
                        'w-2 h-2 rounded-full',
                        c.test(newPassword) ? 'bg-brand-green' : 'bg-surface-300 dark:bg-surface-700'
                      )}
                    />
                    <span className={c.test(newPassword) ? 'text-brand-green' : 'text-surface-500 dark:text-surface-400'}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <Button type="submit" isLoading={savingPassword}>Change Password</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
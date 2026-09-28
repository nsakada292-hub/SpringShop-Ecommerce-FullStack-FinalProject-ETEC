import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, Bell, Save, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

const STORE_KEY = 'ss_store_settings'

interface StoreSettings {
  shopName: string
  contactEmail: string
  contactPhone: string
  address: string
}

const defaultStore: StoreSettings = {
  shopName: 'SpringShop',
  contactEmail: 'hello@springshop.com',
  contactPhone: '+1 (555) 123-4567',
  address: '123 Market Street, New York, NY',
}

const storeSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  contactEmail: z.string().email('Enter a valid email'),
  contactPhone: z.string().min(1, 'Phone is required'),
  address: z.string(),
})

type StoreFormValues = z.infer<typeof storeSchema>

const NOTIF_KEY = 'ss_notification_prefs'

interface NotificationPrefs {
  newOrder: boolean
  lowStock: boolean
  newReview: boolean
}

const defaultPrefs: NotificationPrefs = { newOrder: true, lowStock: true, newReview: false }

function loadNotifPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultPrefs
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  icon: React.ReactNode
}

function ToggleRow({ label, description, checked, onChange, icon }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-surface-200 dark:border-surface-800 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-brand-aqua mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-gradient-primary' : 'bg-surface-300 dark:bg-surface-700'
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'notifications'>('store')
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)
  const [saving, setSaving] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: defaultStore,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const stored = raw ? { ...defaultStore, ...JSON.parse(raw) } : defaultStore
      reset(stored)
    } catch {
      reset(defaultStore)
    }
    setPrefs(loadNotifPrefs())
  }, [reset])

  const onSaveStore = (values: StoreFormValues) => {
    setSaving(true)
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(values))
      toast.success('Store settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setTimeout(() => setSaving(false), 400)
    }
  }

  const onSavePrefs = () => {
    setSavingPrefs(true)
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setTimeout(() => setSavingPrefs(false), 400)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Configure your store and preferences</p>
      </div>

      <div className="flex gap-2 p-1 w-fit rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
        <button
          onClick={() => setActiveTab('store')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'store' ? 'bg-gradient-primary text-white' : 'text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
          )}
        >
          <Store size={16} />
          Store Settings
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'notifications' ? 'bg-gradient-primary text-white' : 'text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
          )}
        >
          <Bell size={16} />
          Notifications
        </button>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        {activeTab === 'store' ? (
          <form onSubmit={handleSubmit(onSaveStore)} className="space-y-5">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Store Settings</h2>
            <div className="space-y-4 max-w-xl">
              <Input label="Shop Name" {...register('shopName')} error={errors.shopName?.message} />
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  <Mail size={14} /> Contact Email
                </label>
                <Input {...register('contactEmail')} error={errors.contactEmail?.message} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  <Phone size={14} /> Contact Phone
                </label>
                <Input {...register('contactPhone')} error={errors.contactPhone?.message} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  <MapPin size={14} /> Address
                </label>
                <Input {...register('address')} placeholder="Store address" />
              </div>
            </div>
            <div>
              <Button type="submit" isLoading={saving}>
                <Save size={16} />
                Save Settings
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Notification Preferences</h2>
            <div className="bg-surface-100 dark:bg-surface-800/30 rounded-xl overflow-hidden">
              <ToggleRow
                label="New Order"
                description="Notify me when a new order is placed"
                icon={<Mail size={16} />}
                checked={prefs.newOrder}
                onChange={(v) => setPrefs((p) => ({ ...p, newOrder: v }))}
              />
              <ToggleRow
                label="Low Stock"
                description="Alert me when a product runs low on stock"
                icon={<Bell size={16} />}
                checked={prefs.lowStock}
                onChange={(v) => setPrefs((p) => ({ ...p, lowStock: v }))}
              />
              <ToggleRow
                label="New Review"
                description="Notify me when a customer leaves a new review"
                icon={<Bell size={16} />}
                checked={prefs.newReview}
                onChange={(v) => setPrefs((p) => ({ ...p, newReview: v }))}
              />
            </div>
            <div>
              <Button onClick={onSavePrefs} isLoading={savingPrefs}>
                <Save size={16} />
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

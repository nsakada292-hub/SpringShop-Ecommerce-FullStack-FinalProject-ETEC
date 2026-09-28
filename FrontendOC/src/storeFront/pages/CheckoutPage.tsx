import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ShoppingBag,
  Lock,
  ArrowLeft,
  MapPin,
  CreditCard,
  Loader2,
  Crosshair,
  Navigation,
  Phone,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '@/shared/api/orders.api'
import { couponApi } from '@/shared/api/newsletter.api'
import { useCart } from '@/shared/contexts/CartContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { formatPrice } from '@/shared/utils/cn'
import type { Coupon } from '@/shared/types'
import { BadgePercent, X } from 'lucide-react'

const checkoutSchema = z.object({
  recipientName: z.string().min(2, 'Please enter the recipient name').max(100, 'Name is too long'),
  recipientEmail: z.string().email('Enter a valid email address'),
  recipientPhone: z
    .string()
    .regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number'),
  shippingAddress: z
    .string()
    .min(10, 'Please provide a complete shipping address (at least 10 characters)')
    .max(500, 'Address is too long'),
  notes: z.string().max(500, 'Notes too long').optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

interface SavedLocation {
  lat: number
  lng: number
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, itemCount, totalAmount, clearCart, isLoading } = useCart()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [locating, setLocating] = useState(false)
  const [location, setLocation] = useState<SavedLocation | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: user?.name ?? '',
      recipientEmail: user?.email ?? '',
      recipientPhone: user?.phone ?? '',
      shippingAddress: '',
      notes: '',
    },
  })

  const remainingUnits = appliedCoupon
    ? Math.max(0, appliedCoupon.maxUsages - appliedCoupon.usedCount)
    : 0

  const promoDiscount = (() => {
    if (!appliedCoupon) return 0
    let remaining = remainingUnits
    let discount = 0
    for (const item of items) {
      if (remaining <= 0) break
      const units = Math.min(item.quantity, remaining)
      discount += item.productPrice * (appliedCoupon.discountPercent / 100) * units
      remaining -= units
    }
    return Math.min(discount, totalAmount)
  })()

  const grandTotal = Math.max(0, totalAmount - promoDiscount)

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) {
      setPromoError('Enter a promo code')
      return
    }
    if (appliedCoupon?.code === code) return
    if (totalAmount <= 0) {
      setPromoError('Your cart is empty')
      return
    }
    setApplyingPromo(true)
    setPromoError(null)
    try {
      const { data } = await couponApi.validate(code)
      const remaining = Math.max(0, data.maxUsages - data.usedCount)
      if (remaining <= 0) {
        setPromoError('This promo code has reached its usage limit')
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon(data)
      setPromoInput(data.code)
      toast.success(`Promo ${data.code} applied`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPromoError(message ?? 'Invalid promo code')
      setAppliedCoupon(null)
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedCoupon(null)
    setPromoInput('')
    setPromoError(null)
  }

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success('Your current location was captured')
        setLocating(false)
      },
      () => {
        toast.error(
          'Could not get your location. Please allow location permission or type your address manually.'
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const onSubmit = async (data: CheckoutForm) => {
    setPlacing(true)
    try {
      const { data: order } = await ordersApi.create({
        shippingAddress: data.shippingAddress,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        recipientPhone: data.recipientPhone,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        notes: data.notes,
        couponCode: appliedCoupon?.code,
      })
      await clearCart()
      navigate(`/payment/${order.id}`)
    } catch {
      toast.error('Failed to place your order. Please try again.')
      setPlacing(false)
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-[#22c55e] dark:text-[#34d399]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
          <ShoppingBag className="h-11 w-11" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Add some items to your cart before checking out.
        </p>
        <Link
          to="/category"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:brightness-110 active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm">
        <Link to="/" className="text-gray-500 transition-colors hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link to="/cart" className="text-gray-500 transition-colors hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]">
          Cart
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900 dark:text-white">Checkout</span>
      </nav>

      <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        <Lock className="h-8 w-8 text-[#22c55e] dark:text-[#34d399]" />
        Secure Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Delivery contact */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Contact</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Who should we contact for this order?</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="recipientName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="recipientName"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 focus:border-[#34d399] dark:bg-surface-900 dark:text-white dark:placeholder-gray-500 ${
                      errors.recipientName
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-surface-200 dark:border-surface-700'
                    }`}
                    {...register('recipientName')}
                  />
                </div>
                {errors.recipientName && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.recipientName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="recipientPhone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="recipientPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 012 345 678"
                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 focus:border-[#34d399] dark:bg-surface-900 dark:text-white dark:placeholder-gray-500 ${
                      errors.recipientPhone
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-surface-200 dark:border-surface-700'
                    }`}
                    {...register('recipientPhone')}
                  />
                </div>
                {errors.recipientPhone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.recipientPhone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="recipientEmail" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="recipientEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 focus:border-[#34d399] dark:bg-surface-900 dark:text-white dark:placeholder-gray-500 ${
                      errors.recipientEmail
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-surface-200 dark:border-surface-700'
                    }`}
                    {...register('recipientEmail')}
                  />
                </div>
                {errors.recipientEmail && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.recipientEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping address & location */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Location</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Where should we deliver your order?</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="shippingAddress" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shipping Address
                </label>
                <textarea
                  id="shippingAddress"
                  rows={4}
                  placeholder="Street address, building, landmark, city"
                  className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 focus:border-[#34d399] dark:bg-surface-900 dark:text-white dark:placeholder-gray-500 ${
                    errors.shippingAddress
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                  {...register('shippingAddress')}
                />
                {errors.shippingAddress && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.shippingAddress.message}</p>
                )}
              </div>

              {/* Current location */}
              <div className="rounded-2xl border border-dashed border-[#34d399]/40 bg-[#34d399]/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <Navigation className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" />
                      Pin your current location
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Helps our delivery team find you easily (by taxi or moto).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Crosshair className="h-4 w-4" />
                        {location ? 'Update Location' : 'Use My Current Location'}
                      </>
                    )}
                  </button>
                </div>

                {location && (
                  <div className="mt-4 space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
                      <iframe
                        title="Delivery location map"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.008}%2C${location.lat - 0.008}%2C${location.lng + 0.008}%2C${location.lat + 0.008}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                        className="h-56 w-full border-0"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <MapPin className="h-3.5 w-3.5 text-[#22c55e] dark:text-[#34d399]" />
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] transition-colors hover:text-[#16a34a] dark:text-[#34d399] dark:hover:text-[#4ade80]"
                      >
                        Open in Google Maps
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Delivery instructions, special requests, etc."
                  className="w-full resize-none rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:placeholder-gray-500"
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment note */}
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#34d399]/40 bg-[#34d399]/5 px-5 py-4">
            <CreditCard className="h-5 w-5 shrink-0 text-[#22c55e] dark:text-[#34d399]" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              After placing your order you'll be taken to the payment page — scan the QR with
              your ACLEDA mobile app to pay instantly.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={placing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>

            <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10 ring-1 ring-gray-100 dark:ring-white/5">
                    <span className="h-full w-full bg-white/5" />
                    <span className="absolute px-1 text-center text-[8px] leading-tight text-gray-400 dark:text-gray-500">
                      {item.productName}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty {item.quantity} × {formatPrice(item.productPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5 mt-5 border-t border-gray-100 pt-5 dark:border-white/5">
              <label htmlFor="promo" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                <BadgePercent className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" />
                Promo Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#34d399]/50 bg-[#34d399]/10 px-4 py-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-[#16a34a] dark:text-[#34d399]">{appliedCoupon.code}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {appliedCoupon.discountPercent}% off up to {remainingUnits} more product{remainingUnits === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    aria-label="Remove promo code"
                    className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-[#34d399]/20 hover:text-[#16a34a]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="promo"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleApplyPromo()
                      }
                    }}
                    placeholder="Enter code"
                    className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/30 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyPromo()}
                    disabled={applyingPromo}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && <p className="mt-1.5 text-xs text-red-500">{promoError}</p>}
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm dark:border-white/5">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <BadgePercent className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" />
                    Promo discount
                  </span>
                  <span className="font-semibold text-[#16a34a] dark:text-[#34d399]">
                    −{formatPrice(promoDiscount)}
                  </span>
                </div>
              )}
              <div className="my-3 border-t border-dashed border-gray-200 dark:border-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                <span className="bg-gradient-to-r from-[#34d399] to-[#22c55e] bg-clip-text text-2xl font-bold text-transparent">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
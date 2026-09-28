import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Hash,
  Landmark,
  Loader2,
  Lock,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { paymentsApi } from '@/shared/api/payments.api'
import type { PaymentCurrency, PaymentInitiateResponse } from '@/shared/types'
import { formatPaymentAmount } from '@/shared/utils/cn'
import bakongLogo from '@/assets/bakong.png'
import khqrLogo from '@/assets/khqr-logo.png'
import PixelBlastBackground from '@/shared/components/PixelBlastBackground'

/**
 * The Bakong Open API allows only a small number of requests per day, and a new
 * token can take up to 24h to arrive, so the budget must not be spent on polling.
 *
 * The backend answers a status request from a short-lived cache and only calls
 * Bakong once per interval per order, so polling faster than this buys nothing -
 * it only adds load. It also means a payment can take up to ~30s to be reflected,
 * which is why the manual "Check payment status" button stays available.
 */

/**
 * Most KHQRs settle within seconds of the customer scanning, so check quickly at
 * first, then stretch out. Combined with the server cache this keeps a normal
 * checkout down to a couple of Bakong requests while still confirming a fast
 * payment almost immediately.
 */
const FAST_POLL_WINDOW_MS = 45_000
const FAST_POLL_INTERVAL_MS = 8_000
const SLOW_POLL_INTERVAL_MS = 45_000

/** Back off when the server reports the daily allowance is exhausted. */
const QUOTA_BACKOFF_POLL_MS = 120_000

/**
 * A KHQR can still settle after it expires - Bakong keeps the md5 resolvable, so
 * money that lands late is real money that must not be lost.
 *
 * This is the single biggest consumer of the daily Bakong allowance, because the
 * page keeps checking for this long *after* expiry. Every abandoned cart is a
 * customer who scanned or opened the page and walked away, and each one costs
 * roughly 40 Bakong requests at this length - about half the daily budget for a
 * single abandoned checkout. At 5 minutes an abandoned cart costs ~10.
 *
 * Late payments are still detected: the manual "Check payment status" button
 * stays available, the order detail page can be re-checked, and the money is
 * never lost - the order simply stays PENDING until someone confirms it.
 */
const LATE_PAYMENT_GRACE_MS = 5 * 60 * 1000

export default function PaymentPage() {
  const { orderId: routeId } = useParams()
  const orderId = Number(routeId)
  const navigate = useNavigate()

  const [currency, setCurrency] = useState<PaymentCurrency>('USD')
  const [payment, setPayment] = useState<PaymentInitiateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [paid, setPaid] = useState(false)
  const [checking, setChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [quotaPaused, setQuotaPaused] = useState(false)

  const mock = payment?.mock ?? false
  const demo = payment?.demo ?? false
  const qrType = payment?.qrType ?? null
  const expired = !!payment && new Date(payment.expiresAt).getTime() <= now

  /**
   * Keep verifying while the QR is live, and for a grace window after it expires.
   * Stopping the moment the countdown hits zero is how a real payment ends up
   * paid but never recorded.
   */
  const withinGraceWindow =
    !!payment && now - new Date(payment.expiresAt).getTime() < LATE_PAYMENT_GRACE_MS

  const initiate = useCallback(
    async (cur: PaymentCurrency) => {
      setLoading(true)
      setError(null)
      setStatusMessage(null)
      try {
        const { data } = await paymentsApi.initiate(orderId, cur)
        setPayment(data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiMessage =
            typeof err.response?.data?.message === 'string'
              ? err.response.data.message
              : null
          if (apiMessage) {
            setError(`Payment failed: ${apiMessage}`)
            return
          }
        }
        setError('Unable to create the payment QR code. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [orderId]
  )

  const checkStatus = useCallback(async () => {
    setChecking(true)
    try {
      const { data } = await paymentsApi.checkStatus(orderId)
      setStatusMessage(data.message ?? null)
      // The server says so when it has stopped calling Bakong to stay inside the
      // daily request allowance. Back off hard instead of hammering it.
      setQuotaPaused(
        typeof data.message === 'string' && data.message.includes('daily request limit'),
      )
      if (data.paid) {
        setPaid(true)
        toast.success('Payment received successfully!')
      }
    } catch {
      // transient network / backend errors are ignored while polling
    } finally {
      setChecking(false)
    }
  }, [orderId])

  // initiate for the selected currency (or show a helpful error for a bad id)
  useEffect(() => {
    if (!Number.isFinite(orderId) || orderId <= 0) {
      setError('Invalid payment link. Please check the order and try again.')
      return
    }
    initiate(currency)
  }, [orderId, currency, initiate])

  // countdown clock
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // auto-poll while the QR is active (off in mock / merchant-demo mode)
  useEffect(() => {
    if (mock || demo) return
    if (!payment || paid) return
    if (!withinGraceWindow) return

    const startedAt = Date.now()
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false

    const tick = async () => {
      await checkStatus()
      if (stopped) return
      const elapsed = Date.now() - startedAt
      const next =
        quotaPaused
          ? QUOTA_BACKOFF_POLL_MS
          : elapsed < FAST_POLL_WINDOW_MS
            ? FAST_POLL_INTERVAL_MS
            : SLOW_POLL_INTERVAL_MS
      timer = setTimeout(tick, next)
    }

    void tick()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
    }
  }, [payment, paid, mock, demo, withinGraceWindow, quotaPaused, checkStatus])

  // when the order is paid, leave the page briefly so the user sees the confirmation
  useEffect(() => {
    if (!paid) return
    const timer = setTimeout(() => navigate(`/orders/${orderId}`, { replace: true }), 1800)
    return () => clearTimeout(timer)
  }, [paid, orderId, navigate])

  const handleCurrencyChange = (cur: PaymentCurrency) => {
    if (cur === currency) return
    setCurrency(cur)
  }

  const getCountdownLabel = () => {
    if (!payment) return ''
    const remainingMs = new Date(payment.expiresAt).getTime() - now
    if (remainingMs <= 0) return 'Expired'
    const totalSeconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const statusLabel = paid
    ? 'Paid'
    : expired
      ? payment
        ? 'Confirming last payment…'
        : '—'
      : payment
        ? `Expires in ${getCountdownLabel()}`
        : loading
          ? 'Waiting for QR…'
          : '—'

  const primaryAction = () => {
    if (error) return void initiate(currency)
    if (mock || demo) return void checkStatus()
    return void checkStatus()
  }

  const primaryLabel = error
    ? 'Try Again'
    : mock || demo
      ? 'Simulate payment'
      : checking
        ? 'Checking…'
        : 'Check payment status'

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Home
        </Link>
        <span>/</span>
        <Link to="/orders" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Orders
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">Payment</span>
      </nav>

      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row dark:border dark:border-white/5">
        {/* LEFT - info panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#22c55e] to-[#4ade80] p-10 md:p-14 lg:w-5/12">
          <div className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-[#86efac] opacity-20 blur-3xl mix-blend-multiply filter"></div>
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#6ee7b7] opacity-20 blur-3xl mix-blend-multiply filter"></div>

          <PixelBlastBackground color="#ffffff" variant="circle" pixelSize={3} speed={0.6} />

          <div className="relative z-10">
            <h3 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Bakong KHQR Payment
            </h3>
            <p className="mb-10 text-lg font-light leading-relaxed text-white">
              Scan the QR code to pay securely through the National Bank
              of Cambodia's Bakong network.
            </p>

            <div className="space-y-6">
              <div className="group flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-[#4ade80]">
                  <Hash className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-50">Order</p>
                  <p className="text-lg">#{orderId}</p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-[#4ade80]">
                  <Wallet className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-50">Amount to pay</p>
                  <p className="text-lg">
                    {payment ? formatPaymentAmount(payment.amount, payment.currency) : loading ? 'Generating…' : '—'}
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-[#4ade80]">
                  <Clock className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-50">Status</p>
                  <p className="text-lg">{statusLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex gap-4">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-300">
              <img src={bakongLogo} alt="ACLEDA Bank" className="h-full w-full rounded-full bg-white object-contain p-1" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 transition-all hover:bg-white hover:text-[#15803d]">
              <Landmark className="text-lg" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 transition-all hover:bg-white hover:text-[#15803d]">
              <ShieldCheck className="text-lg" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 transition-all hover:bg-white hover:text-[#15803d]">
              <Lock className="text-lg" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-300">
              <img src={khqrLogo} alt="Bakong KHQR" className="h-full w-full object-cover" />
            </span>
          </div>
        </div>

        {/* RIGHT - form panel */}
        <div className="relative bg-white p-10 md:p-14 lg:w-7/12">
          <h2 className="mb-2 text-4xl font-bold text-gray-800 md:text-5xl">
            Complete your{' '}
            <span className="italic text-[#22c55e]">Payment</span>
          </h2>
          <p className="mb-8 text-gray-500">
            Scan the QR code with any Cambodian bank app - your order is confirmed automatically.
          </p>

          {quotaPaused && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Automatic confirmation is paused because the Bakong API daily request
                limit was reached. Checking will resume automatically, or press
                &ldquo;Check payment status&rdquo; below to try now. If you have already
                paid, your money is safe and will be picked up - please do not pay twice.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Currency select */}
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-semibold text-gray-600">
                Currency
              </label>
              <div className="relative">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as PaymentCurrency)}
                  disabled={loading || paid}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 transition-all duration-300 focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 focus:outline-none disabled:opacity-60"
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="KHR">Khmer Riel (៛)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown className="text-lg" />
                </div>
              </div>
            </div>

            {/* QR area */}
            {loading && !payment ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
                <p className="text-sm text-gray-500">Generating QR code...</p>
              </div>
            ) : paid ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                <p className="text-lg font-bold text-emerald-700">Payment confirmed</p>
                <p className="mt-1 text-sm text-emerald-600">Redirecting to your order...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : payment?.qr ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div
                    className={`rounded-xl border-2 bg-white p-4 shadow-sm transition-opacity ${
                      expired ? 'border-gray-200 opacity-30' : 'border-gray-200'
                    }`}
                  >
                    <QRCodeSVG value={payment.qr} size={200} level="M" marginSize={0} />
                  </div>
                  {expired && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Clock className="h-7 w-7 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600">Code expired</span>
                    </div>
                  )}
                </div>

                {expired ? (
                  <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-800">This code has expired</p>
                    <p className="mt-1 text-xs text-amber-700">
                      If you already sent money it is safe — press{' '}
                      <span className="font-semibold">Check payment status</span> below and we will
                      confirm it. Otherwise generate a new code to pay.
                    </p>
                    <button
                      type="button"
                      onClick={() => void initiate(currency)}
                      disabled={loading || paid}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ScanLine className="h-3.5 w-3.5" />
                      )}
                      Generate a new code
                    </button>
                  </div>
                ) : demo ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#4ade80]/60 bg-[#22c55e]/5 px-3 py-2 text-xs text-emerald-700">
                    <ScanLine className="h-4 w-4" />
                    Merchant QR (type 30) - the format every Cambodian bank app accepts. Simulate the payment below to finish.
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Smartphone className="text-lg" />
                    {qrType === 'MERCHANT'
                      ? 'Scan with any Cambodian bank app (ACLEDA, ABA, Wing, Bakong…)'
                      : 'Scan with the Bakong app, or a bank app that supports person-to-person transfers'}
                  </p>
                )}

                {statusMessage && !expired && (
                  <p className="w-full rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-600">
                    {statusMessage}
                  </p>
                )}
              </div>
            ) : payment?.mock ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[#4ade80]/60 bg-[#22c55e]/5 py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow">
                  <Wallet className="h-9 w-9 text-[#22c55e]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Mock mode</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Bakong is not connected yet. Simulate a successful payment to test the checkout flow.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Powered by ACLEDA */}
            <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 py-3.5">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Powered by
              </span>
              <img src={khqrLogo} alt="Bakong KHQR" className="h-7 w-auto object-contain" />
              <span className="text-xs font-medium text-gray-500">Bakong KHQR</span>
            </div>

            {/* Primary action */}
            <button
              type="button"
              onClick={primaryAction}
              disabled={loading || paid}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#22c55e] hover:shadow-[#22c55e]/30 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {error ? (
                <RefreshCw className="text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              ) : mock || demo ? (
                <CreditCard className="text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              ) : checking ? (
                <Loader2 className="text-xl animate-spin" />
              ) : (
                <RefreshCw className="text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              )}
              {primaryLabel}
            </button>

            <p className="text-xs leading-relaxed text-gray-400">
              Payment is processed securely through the National Bank of Cambodia's Bakong network.
              Your order stays pending until the payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
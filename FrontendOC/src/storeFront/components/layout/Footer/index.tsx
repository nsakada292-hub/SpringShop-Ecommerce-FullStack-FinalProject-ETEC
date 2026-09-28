import { Link } from 'react-router-dom'
import { useState, type FormEvent, type ReactNode } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import springShopLogo from '@/assets/spring-shop-logo.png'
import bakongLogo from '@/assets/bakong.png'
import khqrLogo from '@/assets/khqr-logo.png'

const shopLinks = [
  { label: 'Home', to: '/' },
  { label: 'Women', to: '/category' },
  { label: 'Men', to: '/category' },
  { label: 'Beauty', to: '/category' },
  { label: 'Kids', to: '/category' },
]

const helpLinks = [
  { label: 'Customer Service', href: '#' },
  { label: 'Shipping Info', href: '#' },
  { label: 'Returns', href: '#' },
  { label: 'Size Guide', href: '#' },
]

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

const socials: { Icon: (p: { className?: string }) => ReactNode; label: string; href: string }[] = [
  { Icon: FacebookIcon, label: 'Facebook', href: '#' },
  { Icon: InstagramIcon, label: 'Instagram', href: '#' },
  { Icon: XIcon, label: 'X', href: '#' },
  { Icon: YoutubeIcon, label: 'Youtube', href: '#' },
]

const features = [
  { Icon: Truck, label: 'Free Shipping', sub: 'On orders over $75' },
  { Icon: RotateCcw, label: 'Easy Returns', sub: '30-day return policy' },
  { Icon: ShieldCheck, label: 'Secure Checkout', sub: 'SSL encrypted payments' },
  { Icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
]

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setEmail('')
    toast.success('Subscribed successfully! Welcome to our community.')
  }

  return (
    <footer className="relative bg-white dark:bg-[#0a0a0c] border-t border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src={springShopLogo}
                alt="SpringShop logo"
                className="h-10 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#34d399] via-[#22c55e] to-[#6ee7b7] bg-clip-text text-transparent">
                SpringShop
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Discover the latest trends in fashion, beauty, and lifestyle. Curated
              collections delivered to your doorstep with care and style.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#34d399] hover:to-[#22c55e] hover:text-white hover:shadow-lg hover:shadow-[#22c55e]/30 hover:-translate-y-0.5 dark:bg-white/5 dark:text-gray-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors duration-200 hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]"
                  >
                    <span className="h-px w-0 bg-[#22c55e] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors duration-200 hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]"
                  >
                    <span className="h-px w-0 bg-[#22c55e] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + contact */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Newsletter
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Subscribe for exclusive deals and new arrivals.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:border-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/20"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399] via-[#22c55e] to-[#6ee7b7] text-white shadow-lg shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/40 hover:scale-105 active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <a
                href="mailto:support@springshop.com"
                className="flex items-center gap-3 transition-colors duration-200 hover:text-[#22c55e] dark:hover:text-[#34d399]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#22c55e]" />
                nsakada292@gmail.com
              </a>
              <a
                href="tel:+18005550199"
                className="flex items-center gap-3 transition-colors duration-200 hover:text-[#22c55e] dark:hover:text-[#34d399]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#22c55e]" />
                +855 17 928 998
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#22c55e]" />
                Near 16 St 139, Phnom Penh
              </p>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} SpringShop. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00e000]" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[#6ee7b7]" />
                Free Shipping Over $75
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#4ce600]" />
                New Weekly Drops
              </span>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <QrCode className="h-3.5 w-3.5" />
                Payment by QR
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 text-gray-500 dark:text-gray-400">
                  <img src={bakongLogo} alt="ACLEDA Bank" className="h-4 w-4 rounded-full object-contain" />
                  BAKONG
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 text-gray-500 dark:text-gray-400">
                  <img src={khqrLogo} alt="Bakong KHQR" className="h-4 w-4 object-contain" />
                  KHQR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

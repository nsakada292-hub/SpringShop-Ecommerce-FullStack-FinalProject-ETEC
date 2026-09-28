import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  Feather,
  Loader2,
  RefreshCcw,
  Sparkles,
  Star,
  Truck,
  Headphones,
  Quote,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/shared/types'
import { productsApi } from '@/shared/api/products.api'
import { newsletterApi } from '@/shared/api/newsletter.api'
import { ProductGrid } from '@/storeFront/components/product/ProductGrid'
import ImageTrail from '@/storeFront/components/ImageTrail'
import CurvedLoop from '@/shared/components/CurvedLoop'
import rothImg from '@/assets/rothhehe.jpg'
import sakadaImg from '@/assets/skdhehe.jpg'
import rothanaImg from '@/assets/rtnhehe.jpg'

const MARQUEE_SPEEDS = [
  'animate-scroll-up-slow',
  'animate-scroll-down-slow',
  'animate-scroll-up-fast',
  'animate-scroll-down-fast',
  'animate-scroll-up-slow',
]

const benefits = [
  { Icon: Truck, title: 'Free Shipping', desc: 'On all orders over $75' },
  { Icon: CreditCard, title: 'Secure Payment', desc: '256-bit SSL encrypted' },
  { Icon: RefreshCcw, title: 'Easy Returns', desc: '30-day money back' },
  { Icon: Headphones, title: '24/7 Support', desc: 'We are always here' },
]

const testimonials = [
  {
    name: 'Mon Srey Roth',
    role: 'Verified Buyer',
    img: rothImg,
    quote:
      'Absolutely obsessed with the new collection. The quality is unreal and the styles feel so fresh. Shipping was lightning fast!',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Neourm Sakada',
    role: 'Loyal Customer',
    img: sakadaImg,
    quote:
      'SpringShop has completely elevated my wardrobe. The fits are perfect every single time, and customer service is outstanding.',
    gradient: 'from-[#34d399] to-[#22c55e]',
  },
  {
    name: 'Roun Rothana',
    role: 'Fashion Blogger',
    img: rothanaImg,
    quote:
      'Hands down my favorite online store. Curated collections, gorgeous fabrics, and checkout is a breeze. 10/10 recommend.',
    gradient: 'from-purple-500 to-fuchsia-500',
  },
]

function Typewriter({ text, className, delay = 0, style }: { text: string; className?: string; delay?: number; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let i = 0
    let deleted = false

    const step = () => {
      if (!deleted) {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i))
          i++
          timeout = setTimeout(step, 120)
        } else {
          timeout = setTimeout(() => {
            deleted = true
            step()
          }, 2000)
        }
      } else {
        if (i > 0) {
          i--
          setDisplayed(text.slice(0, i))
          timeout = setTimeout(step, 60)
        } else {
          timeout = setTimeout(() => {
            deleted = false
            step()
          }, 500)
        }
      }
    }

    timeout = setTimeout(step, delay)
    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span>
      <span className={className} style={style}>{displayed}</span>
      <span className="animate-pulse bg-gradient-to-r from-[#34d399] via-[#4ade80] to-[#22c55e] bg-clip-text text-transparent">
        |
      </span>
    </span>
  )
}

function splitImages(products: Product[], count: number): Product[][] {
  if (products.length === 0) return Array.from({ length: count }, () => [])
  const columns: Product[][] = Array.from({ length: count }, () => [])
  products.forEach((product, index) => {
    columns[index % count].push(product)
  })
  return columns
}

function HeroGallery() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (active) setProducts(data)
      })
      .catch(() => {
        if (active) setProducts([])
      })
    return () => {
      active = false
    }
  }, [])

  const columns = useMemo(() => {
    const sample = products.slice(0, 12)
    return splitImages(sample, 5)
  }, [products])

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden rounded-b-[50px]">
      {/* Animated gallery background */}
      <div
        className="group/gallery absolute inset-0 flex gap-4 px-4 overflow-hidden hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {columns.map((col, colIndex) => {
          const images = col.length > 0 ? [...col, ...col] : []
          const speed = MARQUEE_SPEEDS[colIndex]
          return (
            <div key={colIndex} className="relative flex-1 overflow-hidden">
              <div className={`flex flex-col gap-4 ${speed} group-hover/gallery:[animation-play-state:paused]`}>
                {images.length === 0 ? (
                  <div className="aspect-[3/4] w-full rounded-2xl bg-gradient-to-br from-[#34d399]/10 via-white/5 to-[#22c55e]/10 dark:from-white/5 dark:via-white/5 dark:to-white/5" />
                ) : (
                  images.map((product, i) => (
                    <div
                      key={`${product.id}-${i}`}
                      className="aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg shadow-black/10 ring-1 ring-white/10 dark:ring-white/5"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10">
                          <span className="text-xs text-gray-400">Preview</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Vignette overlay */}
      <div className="hero-vignette absolute inset-0" aria-hidden="true" />

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </div>

      {/* Centered hero content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399] backdrop-blur-sm animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          New Season Collection 2026
        </span>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl animate-slide-up" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
          <span
            className="text-[#f5f5f5]"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.5))' }}
          >
            Welcome To
          </span>{' '}
          <Typewriter
            text="Spring Shop!"
            className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#059669] bg-clip-text text-transparent"
            delay={300}
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}
          />
        </h1>

        <p className="mt-6 max-w-xl text-base text-green-500 dark:text-gray-300 sm:text-lg animate-slide-up" style={{ animationDelay: '100ms', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          Curated styles for every moment — from everyday essentials to statement
          pieces. Discover timeless designs crafted to make you feel confident, all
          in one beautifully curated shop.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95"
          >
            Shop New Arrivals
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 rounded-full border border-gray-400 px-8 py-3.5 text-sm font-semibold text-gray-400 transition-all duration-300 hover:border-[#34d399] hover:bg-[#34d399]/5 hover:text-[#22c55e] active:scale-95 dark:border-white/20 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
          >
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  )
}

function NewInShelf() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (active) setProducts(data)
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const shelfProducts = products.slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
            <span className="h-px w-6 bg-[#34d399]" />
            Fresh drops
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            New In
          </h2>
        </div>
        <Link
          to="/category"
          className="group hidden items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399] sm:inline-flex"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <ProductGrid products={shelfProducts} isLoading={isLoading} />
    </section>
  )
}

function Benefits() {
  const marqueeItems = [...benefits, ...benefits]

  return (
    <section className="group/benefits overflow-hidden border-y border-gray-100 bg-gray-50/60 py-5 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="flex w-max animate-scroll-x items-center gap-8 pr-8 hover:[animation-play-state:paused] group-hover/benefits:[animation-play-state:paused]">
        {marqueeItems.map(({ Icon, title, desc }, i) => (
          <div key={`${title}-${i}`} className="flex shrink-0 items-center gap-4 px-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#34d399] group-hover:to-[#22c55e] group-hover:text-white dark:text-[#34d399] dark:group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="w-[200px]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
          <span className="h-px w-6 bg-[#34d399]" />
          Testimonials
          <span className="h-px w-6 bg-[#34d399]" />
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          What Our Customers Say
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:border-white/5 dark:bg-white/5 dark:hover:shadow-black/30"
          >
            <Quote className="absolute -right-3 -top-3 h-20 w-20 rotate-12 text-gray-100 transition-colors duration-300 group-hover:text-[#34d399]/10 dark:text-white/5" />
            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              “{t.quote}”
            </p>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-md">
                <img
                  src={t.img}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#34d399] via-[#4ade80] to-[#22c55e] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  )
}

function Newsletter() {
  const [items, setItems] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (active) {
          const images = data.map((p) => p.image).filter((img): img is string => Boolean(img))
          setItems(images.slice(0, 8))
        }
      })
      .catch(() => {
        if (active) setItems([])
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await newsletterApi.subscribe(email)
      setEmail('')
      toast.success(
        `Subscribed! Your code ${data.code} gives you 10% off your first order.`
      )
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to subscribe. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div
        style={{ height: '580px', position: 'relative', overflow: 'hidden' }}
        className="overflow-hidden rounded-3xl border-2 border-[#34d399]/30 bg-white/10 backdrop-blur-xl shadow-xl shadow-[#22c55e]/10 dark:bg-white/5"
      >
        <ImageTrail key="newsletter-trail" items={items} variant={1} />

        <div className="pointer-events-none absolute inset-0 z-[200] flex flex-col items-center justify-center px-4 text-center">
          <div className="pointer-events-none mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#34d399]/15 text-[#22c55e] backdrop-blur-sm dark:text-[#34d399]">
            <Feather className="h-8 w-8" />
          </div>
          <h2 className="pointer-events-none text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Join Our Mailing List
          </h2>
          <p className="pointer-events-none mx-auto mt-3 max-w-lg text-gray-600 dark:text-gray-300 sm:text-lg">
            Get 10% off your first order — plus exclusive early access to new
            arrivals, special offers, and style inspiration delivered straight to
            your inbox.
          </p>

          <p className="pointer-events-none mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#34d399]/15 px-3.5 py-1 text-xs font-bold text-[#16a34a] backdrop-blur-sm dark:text-[#34d399]">
            <Sparkles className="h-3.5 w-3.5" />
            SIGN UP TODAY &amp; SAVE 10%
          </p>

          <form onSubmit={handleSubscribe} className="pointer-events-auto mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-[#34d399]/40 bg-white/80 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 backdrop-blur transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <p className="pointer-events-none mt-4 text-xs text-gray-500 dark:text-gray-400">
            Your promo code will appear in your account under My Promo Codes.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <HeroGallery />
      <section className="overflow-hidden">
        <CurvedLoop marqueeText="Welcome To Spring Shop ✦ Curate Your Style ✦" speed={1.5} curveAmount={120} />
      </section>
      <NewInShelf />
      <Benefits />
      <Reviews />
      <Newsletter />
    </div>
  )
}

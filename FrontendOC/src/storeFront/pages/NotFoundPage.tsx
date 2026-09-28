import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Home, ShoppingBag, Sparkles } from 'lucide-react'
import { Lottie } from 'lottie-react'

const NOT_FOUND_ANIMATION_URL = '/not-found.json'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
  }),
}

const quickLinks = [
  { label: 'Shop All Products', to: '/category', Icon: ShoppingBag },
  { label: 'New Arrivals', to: '/category', Icon: Compass },
  { label: 'About Us', to: '/about', Icon: Sparkles },
]

export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#34d399]/15 blur-3xl dark:bg-[#34d399]/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#22c55e]/15 blur-3xl dark:bg-[#22c55e]/10" />

      <div className="relative mx-auto w-full max-w-2xl text-center">
        {/* <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#15803d] backdrop-blur-sm dark:border-[#34d399]/20 dark:bg-white/5 dark:text-[#6ee7b7]">
            <Sparkles className="h-3.5 w-3.5" />
            Error 404
          </span>
        </motion.div> */}

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="relative mx-auto mt-4 w-fit">
          <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-[#34d399]/25 to-[#22c55e]/15 blur-2xl" aria-hidden="true" />
          <Lottie
            src={NOT_FOUND_ANIMATION_URL}
            className="h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 lg:h-[32rem] lg:w-[32rem]"
            loop
            autoplay
          />
        </motion.div>

        <motion.h1
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="-mt-17 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
        >
          Page{' '}
          <span className="bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#10b981] bg-clip-text text-transparent">
            Not Found
          </span>
        </motion.h1>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/category"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-8 py-3.5 text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-[#34d399] hover:bg-[#34d399]/5 hover:text-[#22c55e] active:scale-95 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
          >
            Explore Products
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </motion.div>

        <motion.p
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-5 max-w-md text-base text-gray-600 sm:text-lg dark:text-gray-300"
        >
          Oops! The page you are looking for doesn't exist or has been moved.
          Let's get you back on track.
        </motion.p>

        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-14 max-w-md border-t border-[#34d399]/15 pt-8 dark:border-[#34d399]/10"
        >
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            You might be looking for
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {quickLinks.map(({ label, to, Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="inline-flex items-center gap-2 rounded-full border border-[#6ee7b7]/30 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#34d399] hover:text-[#22c55e] hover:shadow-lg hover:shadow-[#22c55e]/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-[#34d399]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
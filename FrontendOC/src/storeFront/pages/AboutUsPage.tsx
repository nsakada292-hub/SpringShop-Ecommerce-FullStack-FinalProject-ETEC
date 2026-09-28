import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

import {
  Eye,
  Target,
  Rocket,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

import GradientWaves from '@/storeFront/components/GradientWaves'
import TiltedCard from '@/storeFront/components/TiltedCard'
import Circles from '@/storeFront/components/Circles'

import sakadaImg from '@/assets/skdetec.jpg'
import rothImg from '@/assets/rothetec.jpg'
import rothanaImg from '@/assets/rtnetec.jpg'
import mentorImg from '@/assets/mentor.jpg'
import etecImg from '@/assets/etec-logo.jpg'
import springShopLogo from '@/assets/spring-shop-logo.png'
import teametecImg from '@/assets/teametec.jpg'

import javaIcon from '@/assets/tech-icons/java-original.svg'
import springIcon from '@/assets/tech-icons/spring-original.svg'
import html5Icon from '@/assets/tech-icons/html5-original.svg'
import css3Icon from '@/assets/tech-icons/css3-original.svg'
import tsIcon from '@/assets/tech-icons/typescript-original.svg'
import tailwindIcon from '@/assets/tech-icons/tailwindcss-original.svg'
import reactIcon from '@/assets/tech-icons/react-original.svg'
import postgresIcon from '@/assets/tech-icons/postgresql-original.svg'
import gitIcon from '@/assets/tech-icons/git-original.svg'
import nodejsIcon from '@/assets/tech-icons/nodejs-original.svg'
import vscodeIcon from '@/assets/tech-icons/vscode-color.png'
import intellijIcon from '@/assets/tech-icons/intellij-color.png'
import postmanIcon from '@/assets/tech-icons/postman-original.svg'

/* ───────────────────────────── data ───────────────────────────── */

const slides = [
  {
    icon: Eye,
    title: 'Our Vision',
    desc: 'To become a leading force in digital innovation, empowering businesses and communities through accessible, high-quality software solutions that make a real difference.',
  },
  {
    icon: Target,
    title: 'Our Goal',
    desc: 'To build reliable, scalable, and user-friendly applications by combining modern technologies with a passion for continuous learning and teamwork.',
  },
  {
    icon: Rocket,
    title: 'Future Plan',
    desc: 'We aim to expand our skill set, contribute to open-source projects, and eventually launch our own products that solve everyday problems for users worldwide.',
  },
]

const techStack = [
  { name: 'HTML5', icon: html5Icon },
  { name: 'CSS3', icon: css3Icon },
  { name: 'TypeScript', icon: tsIcon },
  { name: 'Java', icon: javaIcon },
  { name: 'Spring', icon: springIcon },
  { name: 'React', icon: reactIcon },
  { name: 'Tailwind CSS', icon: tailwindIcon },
  { name: 'PostgreSQL', icon: postgresIcon },
  { name: 'Git', icon: gitIcon },
  { name: 'Node.js', icon: nodejsIcon },
  { name: 'VS Code', icon: vscodeIcon },
  { name: 'IntelliJ IDEA', icon: intellijIcon },
  { name: 'Postman', icon: postmanIcon },
]

const techRingRows = [
  techStack.slice(0, 3).map((t) => t.icon),
  techStack.slice(3, 7).map((t) => t.icon),
  techStack.slice(7).map((t) => t.icon),
]
const techByName = new Map(techStack.map((t) => [t.icon, t.name]))

const TECH_CIRCLES = {
  rows: techRingRows,
  circleSize: 68,
  baseRadius: 135,
  orbitGap: 105,
  rotationDuration: 26,
  rowDelay: 2,
  alternateDirection: true,
  showPaths: true,
  animate: true,
  animationDuration: 0.7,
  animationStagger: 0.2,
}
const techContainerSize =
  2 * (TECH_CIRCLES.baseRadius + TECH_CIRCLES.orbitGap * (TECH_CIRCLES.rows.length - 1) + TECH_CIRCLES.circleSize)

const teamMembers = [
  {
    name: 'Kheang Meng Heng',
    role: 'Mentor / Teacher',
    img: mentorImg,
    tier: 1,
    socials: {
      github: 'https://github.com/Mengheng855',
      facebook: 'https://web.facebook.com/mengheng85555',
      telegram: 'https://t.me/IM_BROKEN29',
    },
  },
  {
    name: 'Neourm Sakada',
    role: 'Group Leader',
    img: sakadaImg,
    tier: 2,
    socials: {
      github: 'https://github.com/nsakada292-hub?tab=repositories',
      facebook: 'https://www.facebook.com/sakada.neourm',
      telegram: 'https://t.me/neourmsakada',
    },
  },
  {
    name: 'Mon Srey Roth',
    role: 'Member',
    img: rothImg,
    tier: 3,
    socials: {
      github: 'https://github.com/sreyrothmon27-ctrl',
      facebook: 'https://www.facebook.com/mon.sreyroth.381031',
      telegram: 'https://t.me/monsreyroth',
    },
  },
  {
    name: 'Roun Rothana',
    role: 'Member',
    img: rothanaImg,
    tier: 3,
    socials: {
      github: 'https://github.com/rounrothana168-jpg',
      facebook: 'https://www.facebook.com/roun.rothana.7',
      telegram: 'https://t.me/rounrothana',
    },
  },
]

/* ─────────────────────────── animation ─────────────────────────── */

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
      } as Variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───────────────────── section components ───────────────────── */

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="relative overflow-hidden rounded-b-[50px]">
      <div className="pointer-events-none absolute inset-0">
        <GradientWaves
          horizonColor="#00ff58"
          waveColor="#00ff26"
          crestColor="#18181b"
          speed={0.4}
          amplitude={2.65}
          waveScale={0.7}
          waveRatio={0.9}
          swell={35.5}
          turbulence={22}
          tilt={1.11}
          zoom={0.9}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.025}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white dark:to-[#0a0a0c]" />

      <div
        ref={ref}
        className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-32 sm:px-6 sm:pt-36 lg:grid-cols-2 lg:gap-8 lg:px-8"
      >
        {/* Left — copy */}
        <div>
          <motion.p
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#15803d] backdrop-blur dark:border-[#34d399]/20 dark:bg-white/5 dark:text-[#6ee7b7]"
          >
            ETEC Software Team
          </motion.p>

          <motion.h1
            custom={0}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUp}
            className="text-left text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            We turn ideas into{' '}
            <span className="bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#10b981] bg-clip-text text-transparent">
              working software
            </span>
          </motion.h1>

          <motion.p
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUp}
            className="mt-6 max-w-xl text-left text-lg text-gray-600 sm:text-xl dark:text-gray-300"
          >
            A small, passionate team of developers — building real projects, learning by
            doing, and shipping with purpose.
          </motion.p>
        </div>

        {/* Right — photo */}
        <motion.div
          custom={2}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="relative flex items-center justify-center"
        >
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#34d399]/25 to-[#22c55e]/20 blur-xl" />
            <TiltedCard
              imageSrc={teametecImg}
              altText="ETEC SpringShop Team"
              captionText="ETEC SpringShop Team"
              containerHeight="320px"
              containerWidth="320px"
              imageHeight="320px"
              imageWidth="320px"
              rotateAmplitude={12}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip
              displayOverlayContent
              overlayContent={
                <p className="rounded-full bg-black/50 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  ETEC SpringShop Team
                </p>
              }
            />
          </div>
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="flex justify-center"
        >
          <a
            href="#team"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16a34a] to-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110"
          >
            Meet the Team
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function VisionCarousel() {
  const [active, setActive] = useState(0)
  const [stageWidth, setStageWidth] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = slides.length

  const goTo = useCallback((i: number) => {
    const target = (i + total) % total
    activeRef.current = target
    setActive(target)
  }, [total])

  const next = useCallback(() => goTo(activeRef.current + 1), [goTo])
  const prev = useCallback(() => goTo(activeRef.current - 1), [goTo])

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startAutoplay = useCallback(() => {
    stopAutoplay()
    timerRef.current = setInterval(next, 5000)
  }, [next, stopAutoplay])

  useEffect(() => {
    startAutoplay()
    return stopAutoplay
  }, [startAutoplay, stopAutoplay])

  useEffect(() => {
    const measure = () => {
      if (stageRef.current) setStageWidth(stageRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const spacing = Math.max(180, stageWidth * 0.42)

  return (
    <AnimatedSection className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          Vision, Goal & Future
        </h2>

        <div
          ref={stageRef}
          className="relative mx-auto h-[440px] w-full max-w-md [perspective:1600px] sm:h-[480px] sm:max-w-xl md:h-[520px] md:max-w-3xl"
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {slides.map((s, i) => {
              const Icon = s.icon
              let offset = i - active
              if (offset > total / 2) offset -= total
              if (offset < -total / 2) offset += total
              const abs = Math.abs(offset)
              const tx = offset * spacing
              const tz = -abs * 260
              const ry = offset * -32
              const scale = 1 - abs * 0.14
              const opacity = abs > 2 ? 0 : 1 - abs * 0.38
              const isActive = abs === 0

              return (
                <div
                  key={s.title}
                  className="absolute left-1/2 top-1/2 w-[280px] rounded-3xl border border-[#6ee7b7]/30 bg-white/95 p-7 shadow-xl shadow-[#22c55e]/10 backdrop-blur-md transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] sm:w-[340px] md:w-[420px] md:p-9 dark:border-[#34d399]/15 dark:bg-[#0e3a2a]/80 dark:shadow-black/30"
                  style={{
                    transform: `translate(-50%,-50%) translate3d(${tx}px,0,${tz}px) rotateY(${ry}deg) scale(${scale})`,
                    opacity,
                    zIndex: 50 - abs,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#22c55e] dark:text-[#34d399]">
                    0{i + 1} / {i === 0 ? 'Vision' : i === 1 ? 'Goal' : 'Future'}
                  </span>
                  <div className="mt-6 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34d399]/25 to-[#22c55e]/25 text-[#15803d] dark:text-[#34d399]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600 md:text-base dark:text-gray-300">{s.desc}</p>
                </div>
              )
            })}
          </div>

          {/* arrows */}
          <button
            type="button"
            onClick={() => { prev(); startAutoplay() }}
            aria-label="Previous slide"
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#6ee7b7]/30 bg-white p-2.5 text-gray-600 shadow-lg backdrop-blur transition hover:bg-gray-50 hover:text-[#16a34a] md:left-2 dark:border-white/15 dark:bg-black/40 dark:text-white/80 dark:hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => { next(); startAutoplay() }}
            aria-label="Next slide"
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#6ee7b7]/30 bg-white p-2.5 text-gray-600 shadow-lg backdrop-blur transition hover:bg-gray-50 hover:text-[#16a34a] md:right-2 dark:border-white/15 dark:bg-black/40 dark:text-white/80 dark:hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* dots */}
        <div className="mt-10 flex justify-center gap-3">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { goTo(i); startAutoplay() }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-6 bg-[#22c55e]' : 'w-2.5 bg-gray-300 dark:bg-white/25'
              }`}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

function TechStackSection() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const avail = Math.min(window.innerWidth - 48, 1100)
      setScale(Math.min(1, avail / techContainerSize))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <AnimatedSection className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-20 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          Our Tech Stack
        </h2>
      </div>

      <div
        className="relative mx-auto"
        style={{ width: techContainerSize * scale, height: techContainerSize * scale }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: techContainerSize,
            height: techContainerSize,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <Circles
            rows={TECH_CIRCLES.rows}
            circleSize={TECH_CIRCLES.circleSize}
            baseRadius={TECH_CIRCLES.baseRadius}
            orbitGap={TECH_CIRCLES.orbitGap}
            rotationDuration={TECH_CIRCLES.rotationDuration}
            rowDelay={TECH_CIRCLES.rowDelay}
            alternateDirection={TECH_CIRCLES.alternateDirection}
            showPaths={TECH_CIRCLES.showPaths}
            animate={TECH_CIRCLES.animate}
            animationDuration={TECH_CIRCLES.animationDuration}
            animationStagger={TECH_CIRCLES.animationStagger}
            renderItem={(src, _row, _col) => (
              <img
                src={src}
                alt={techByName.get(src) ?? 'Tech icon'}
                title={techByName.get(src) ?? 'Tech icon'}
                loading="lazy"
                className="h-[52%] w-[52%] object-contain"
              />
            )}
          />
        </div>

        <img
          src={springShopLogo}
          alt="SpringShop logo"
          className="absolute left-1/2 top-1/2 z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-2xl"
        />
      </div>
    </AnimatedSection>
  )
}

function TeamMemberCard({ member }: { member: typeof teamMembers[number] }) {
  const socialIcons = [
    { key: 'github', Icon: GithubIcon, label: 'GitHub' },
    { key: 'facebook', Icon: FacebookIcon, label: 'Facebook' },
    { key: 'telegram', Icon: Send, label: 'Telegram' },
  ] as const

  return (
    <motion.div
      variants={fadeUp}
      custom={member.tier}
      className="group relative flex flex-col items-center text-center"
    >
      <div className="relative mb-6 overflow-hidden rounded-full border-4 border-white shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl dark:border-[#111114]">
        <img
          src={member.img}
          alt={member.name}
          className="h-36 w-36 object-cover sm:h-44 sm:w-44"
        />
      </div>

      <span className="mb-2 rounded-full bg-[#22c55e]/10 px-4 py-1 text-xs font-semibold text-[#22c55e] dark:bg-[#34d399]/10 dark:text-[#34d399]">
        {member.role}
      </span>
      <h3 className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>

      <div className="mt-5 flex items-center gap-3">
        {socialIcons.map(({ key, Icon, label }) => {
          const href = member.socials[key]
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} — ${label}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-[#22c55e] hover:text-white hover:shadow-lg hover:shadow-[#22c55e]/30 dark:bg-white/5 dark:text-gray-500 dark:hover:bg-[#22c55e]"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          )
        })}
      </div>
    </motion.div>
  )
}

function TeamSection() {
  const mentor = teamMembers.find((m) => m.tier === 1)!
  const leader = teamMembers.find((m) => m.tier === 2)!
  const members = teamMembers.filter((m) => m.tier === 3)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="team" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="mb-20 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Meet the Team
          </h2>
        </AnimatedSection>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col items-center"
        >
          {/* Tier 1 — Mentor */}
          <motion.div variants={fadeUp} custom={1}>
            <TeamMemberCard member={mentor} />
          </motion.div>

          {/* Connector line mentor → leader */}
          <div className="my-14 h-16 w-px bg-gradient-to-b from-[#22c55e] to-[#34d399] dark:from-[#34d399] dark:to-[#22c55e]" />

          {/* Tier 2 — Leader */}
          <motion.div variants={fadeUp} custom={2}>
            <TeamMemberCard member={leader} />
          </motion.div>

          {/* Connector line leader → members */}
          <div className="my-14 flex items-start">
            <div className="h-16 w-px bg-gradient-to-b from-[#22c55e] to-[#34d399] dark:from-[#34d399] dark:to-[#22c55e]" />
          </div>

          {/* Horizontal bar spanning the two members */}
          <div className="-mt-10 mb-12 flex w-full max-w-md items-center justify-center">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent dark:via-[#34d399]/50" />
          </div>

          {/* Tier 3 — Members */}
          <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 sm:gap-32 lg:gap-40">
            {members.map((m) => (
              <motion.div key={m.name} variants={fadeUp} custom={3}>
                <TeamMemberCard member={m} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function OrganizationSection() {
  return (
    <AnimatedSection className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-14 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          Our Organization
        </h2>

        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#6ee7b7]/25 bg-white shadow-xl shadow-[#22c55e]/10 dark:border-[#34d399]/15 dark:bg-white/[0.03]">
          {/* top accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#34d399] via-[#22c55e] to-[#6ee7b7]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#34d399]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#6ee7b7]/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
            {/* Logo — left, kept small so it stays sharp */}
            <div className="flex flex-shrink-0 items-center justify-center rounded-2xl border border-[#6ee7b7]/25 bg-gradient-to-br from-[#f7fdfa] to-[#eafcf2] p-5 dark:border-[#34d399]/15 dark:from-white/[0.04] dark:to-white/[0.01]">
              <img
                src={etecImg}
                alt="ETEC — Engineering of Technology and Electronic Center"
                className="h-28 w-28 object-contain sm:h-32 sm:w-32"
              />
            </div>

            {/* Text — right */}
            <div className="text-center sm:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#15803d] dark:border-[#34d399]/25 dark:bg-[#34d399]/10 dark:text-[#34d399]">
                <Sparkles className="h-3.5 w-3.5" />
                Engineering & Technology
              </p>
              <h3 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Engineering of Technology and Electronic Center
              </h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
                ETEC
              </p>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                ETEC is a technical education center dedicated to equipping students with practical
                skills in software engineering, electronics, and modern technology. Through
                hands-on projects and an industry-relevant curriculum, ETEC prepares the next
                generation of engineers and developers to thrive in the digital world.
              </p>

              {/* stat chips */}
              <div className="mt-5 flex flex-wrap items-center justify-start gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#6ee7b7]/30 bg-[#f0faf5] px-3 py-2 dark:border-[#34d399]/15 dark:bg-white/[0.03]">
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">3+</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Years of Code</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#6ee7b7]/30 bg-[#f0faf5] px-3 py-2 dark:border-[#34d399]/15 dark:bg-white/[0.03]">
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">Fullstack</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Curriculum</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#6ee7b7]/30 bg-[#f0faf5] px-3 py-2 dark:border-[#34d399]/15 dark:bg-white/[0.03]">
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">100%</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Hands-on</p>
                </div>
              </div>

              <a
                href="https://www.facebook.com/etectrainingcenter"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16a34a] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/40 hover:brightness-110"
              >
                Visit ETEC
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ──────────────────────── page export ──────────────────────── */

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <HeroSection />
      <VisionCarousel />
      <TechStackSection />
      <TeamSection />
      <OrganizationSection />
    </div>
  )
}

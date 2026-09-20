import { motion } from 'framer-motion'
import Reveal from './Reveal'
import useApi from '../hooks/useApi'
import useAvatarTheme from '../hooks/useAvatarTheme'
import './hero.css'

const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const svg = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

// Small icon next to each skill chip, picked from the skill's name
function SkillIcon({ name }) {
  if (/\bai\b/i.test(name)) {
    return (
      <svg {...svg}>
        <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
        <path d="M19 3v4M17 5h4" />
      </svg>
    )
  }
  if (/\b(fb|facebook)\b/i.test(name)) {
    return (
      <svg {...svg}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )
  }
  if (/\b(yt|youtube)\b/i.test(name)) {
    return (
      <svg {...svg}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    )
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-accent" />
}

export default function Hero({ profile }) {
  const { data: skills } = useApi('/skills/')
  useAvatarTheme(profile?.avatar_url) // <- sets the site accent from the photo

  const avatar = profile?.avatar_url
  const title = profile?.title || 'Full-Stack Developer'
  const tagline = profile?.tagline || 'I turn ideas into working digital systems.'
  const topSkills = (skills || []).slice(0, 6)

  // "Life happens. Move forward." -> line 1: "Life happens."  line 2 (gradient): "Move forward."
  const sentences = tagline.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [tagline]
  const [first, ...rest] = sentences
  const second = rest.join(' ')

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-16 lg:flex lg:min-h-screen lg:items-center"
    >
      {avatar && (
        <>
          {/* color glow behind the photo, follows the theme color */}
          <div className="hero-glow -z-10" aria-hidden="true" />

          {/* Photo: on top on mobile, big on the right on desktop */}
          <motion.div
            className="hero-photo -z-10 mx-auto aspect-square w-full max-w-md sm:max-w-lg lg:absolute lg:bottom-0 lg:right-0 lg:top-16 lg:mx-0 lg:aspect-auto lg:w-[58%] lg:max-w-none"
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={avatar}
              alt={profile?.full_name || 'Profile photo'}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </>
      )}

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 lg:pb-0">
        <div className={`max-w-xl ${avatar ? '-mt-12 lg:mt-0' : 'pt-12'}`}>
          {profile?.available_for_work && (
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs text-ink">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Available for work
              </p>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent">{title}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">{first}</span>
              {second && (
                <span
                  className="block bg-clip-text pb-2 text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--color-accent), var(--accent-2))' }}
                >
                  {second}
                </span>
              )}
            </h1>
          </Reveal>

          {topSkills.length > 0 && (
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {topSkills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-ink"
                  >
                    <span className="text-accent"><SkillIcon name={s.name} /></span>
                    {s.name}
                  </span>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => goTo('work')}
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--color-accent), var(--accent-2))',
                  boxShadow: '0 12px 40px -12px color-mix(in srgb, var(--color-accent) 70%, transparent)',
                }}
              >
                View my work
                <svg {...svg}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
              <button
                onClick={() => goTo('contact')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/40 px-7 py-3.5 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
              >
                <svg {...svg}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                Contact me
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
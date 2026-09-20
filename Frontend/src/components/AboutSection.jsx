import useApi from '../hooks/useApi'
import Reveal from './Reveal'
import { formatMonth, small } from '../lib/format'

function Timeline({ heading, items, empty }) {
  return (
    <div>
      <h3 className="mb-6 text-sm uppercase tracking-widest text-muted">{heading}</h3>
      {items.length === 0 ? (
        <p className="text-muted">{empty}</p>
      ) : (
        <div className="space-y-8 border-l border-line pl-6">
          {items.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.08}>
              <div className="relative">
                <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                <p className="text-xs uppercase tracking-widest text-accent">{item.period}</p>
                <p className="mt-1 font-display text-lg font-semibold">{item.title}</p>
                {item.subtitle && <p className="text-sm text-muted">{item.subtitle}</p>}
                {item.text && <p className="mt-2 whitespace-pre-line text-sm text-muted">{item.text}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

const gradient = 'linear-gradient(90deg, var(--color-accent), var(--accent-2, var(--color-accent)))'

export default function AboutSection({ profile }) {
  const { data: education } = useApi('/education/')
  const { data: experience } = useApi('/experience/')
  const { data: projects } = useApi('/projects/')
  const { data: skills } = useApi('/skills/')
  const { data: certs } = useApi('/certifications/')
  const { data: awards } = useApi('/achievements/')

  const photo = profile?.about_image_url || profile?.avatar_url
  const quote = profile?.about_quote

  // "Better Code Bigger Dreams" -> one word per line (long quotes are grouped into about 4 lines)
  const words = (quote || '').trim().split(/\s+/).filter(Boolean)
  const perLine = Math.max(1, Math.ceil(words.length / 4))
  const quoteLines = Array.from({ length: Math.ceil(words.length / perLine) }, (_, i) =>
    words.slice(i * perLine, (i + 1) * perLine).join(' ')
  )
  const beam = 'linear-gradient(to bottom, transparent, var(--color-accent), transparent)'

  const stats = [
    { value: projects?.length, label: 'Projects built' },
    profile?.years_learning ? { value: `${profile.years_learning}+`, label: 'Years learning' } : null,
    { value: skills?.length, label: 'Skills' },
    { value: (certs?.length || 0) + (awards?.length || 0), label: 'Certs & awards' },
  ].filter((s) => s && s.value)

  const eduItems = (education || []).map((e) => ({
    key: `edu-${e.id}`,
    period: [e.start_year, e.end_year || (e.status ? e.status : 'Present')].filter(Boolean).join(' – '),
    title: [e.degree, e.field_of_study].filter(Boolean).join(', ') || e.school_name,
    subtitle: e.school_name,
  }))

  const expItems = (experience || []).map((x) => ({
    key: `exp-${x.id}`,
    period: `${formatMonth(x.start_date)} – ${x.end_date ? formatMonth(x.end_date) : 'Present'}`,
    title: x.job_title,
    subtitle: [x.company_name, x.employment_status].filter(Boolean).join(' · '),
    text: x.description,
  }))

  return (
    <>
      <div className="grid items-center gap-10 md:grid-cols-5 md:gap-14">
        {photo && (
          <Reveal className="md:col-span-2">
            <div className="relative mx-auto max-w-sm">
              {/* offset frame behind the photo */}
              <div className="absolute -inset-3 rotate-3 rounded-[2rem] border border-accent/30" aria-hidden="true" />
              {/* gradient border + glow, uses the theme color */}
              <div
                className="relative rounded-[1.75rem] p-[2px]"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--color-accent), transparent 45%, var(--accent-2, var(--color-accent)))',
                  boxShadow: '0 24px 60px -24px color-mix(in srgb, var(--color-accent) 60%, transparent)',
                }}
              >
                <div className="relative overflow-hidden rounded-[1.65rem] bg-surface">
                  <img
                    src={small(photo, 900)}
                    alt={profile?.full_name || 'Profile photo'}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />

                  {/* theme-colored wash and light streaks */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen" aria-hidden="true">
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: 'radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent 55%)' }}
                    />
                    <span className="absolute -top-8 left-[14%] h-56 w-[3px] rotate-[35deg] rounded-full opacity-70" style={{ backgroundImage: beam }} />
                    <span className="absolute -top-6 right-[16%] h-72 w-[2px] -rotate-[35deg] rounded-full opacity-60" style={{ backgroundImage: beam }} />
                    <span className="absolute right-[3%] top-12 h-40 w-[2px] rotate-[35deg] rounded-full opacity-60" style={{ backgroundImage: beam }} />
                  </div>

                  {quoteLines.length > 0 && (
                    <>
                      {/* dark fade so the words stay readable on any photo */}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ backgroundImage: 'linear-gradient(to top right, rgba(0,0,0,.78), rgba(0,0,0,.12) 55%, transparent)' }}
                        aria-hidden="true"
                      />
                      <p
                        className="absolute bottom-5 left-5 max-w-[75%] origin-bottom-left -rotate-6 bg-clip-text px-2 pb-2 text-4xl leading-[1.05] text-transparent sm:text-5xl"
                        style={{
                          fontFamily: '"Kaushan Script", cursive',
                          backgroundImage: 'linear-gradient(160deg, var(--accent-2, var(--color-accent)), var(--color-accent) 60%, #fff 140%)',
                          filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--color-accent) 70%, transparent))',
                        }}
                      >
                        {quoteLines.map((line, i) => (
                          <span key={i} className="block">{line}</span>
                        ))}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.1} className={photo ? 'md:col-span-3' : 'md:col-span-5'}>
          <h3 className="font-display text-4xl font-bold">
            About <span className="text-accent">me</span>
          </h3>
          <div className="mt-3 h-1 w-16 rounded-full" style={{ backgroundImage: gradient }} />

          <p className="mt-6 max-w-2xl whitespace-pre-line text-muted">{profile?.bio || 'Bio coming soon.'}</p>

          {profile?.location && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-sm text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {profile.location}
            </p>
          )}

          {stats.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="sm:border-l sm:border-line sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
                  <p className="font-display text-3xl font-bold text-accent">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        <Timeline heading="Experience" items={expItems} empty="Experience coming soon." />
        <Timeline heading="Education" items={eduItems} empty="Education coming soon." />
      </div>
    </>
  )
}
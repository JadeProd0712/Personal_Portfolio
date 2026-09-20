import useApi from '../hooks/useApi'
import Reveal from './Reveal'
import LoadMore from './LoadMore'
import { formatMonth, small } from '../lib/format'

const LEVELS = { beginner: 1, intermediate: 2, advanced: 3 }

function SubHeading({ children }) {
  return <h3 className="mb-6 text-sm uppercase tracking-widest text-muted">{children}</h3>
}

function Skills({ skills }) {
  const groups = skills.reduce((acc, s) => {
    const key = s.category || 'Other'
    ;(acc[key] = acc[key] || []).push(s)
    return acc
  }, {})

  return (
    <div className="card-grid">
      {Object.entries(groups).map(([category, list], i) => (
        <Reveal key={category} delay={(i % 2) * 0.1}>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="mb-4 font-display text-lg font-semibold">{category}</p>
            <ul className="space-y-3">
              {list.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{s.name}</span>
                  <span className="flex gap-1" title={s.level}>
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={`h-1.5 w-5 rounded-full ${n <= (LEVELS[s.level] || 0) ? 'bg-accent' : 'bg-line'}`} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

// Card used by both Certifications and Achievements
function InfoCard({ image, title, meta, description, href, linkLabel }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/60">
      {image && (
        <a href={image} target="_blank" rel="noreferrer" className="block aspect-[4/3] shrink-0 overflow-hidden bg-elevated" title="Open full image">
          <img src={small(image, 800)} alt={title} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 hover:scale-[1.03]" />
        </a>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-lg font-semibold">{title}</p>
        {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
        {description && <p className="mt-2 line-clamp-3 text-sm text-muted">{description}</p>}
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="mt-auto pt-4 text-sm text-accent">{linkLabel} ↗</a>
        )}
      </div>
    </div>
  )
}

export default function ExpertiseSection() {
  const { data: skills } = useApi('/skills/')
  const { data: services } = useApi('/services/')
  const { data: certs } = useApi('/certifications/')
  const { data: awards } = useApi('/achievements/')

  return (
    <div className="space-y-20">
      <div>
        <SubHeading>Skills</SubHeading>
        {skills && skills.length > 0 ? <Skills skills={skills} /> : <p className="text-muted">Skills coming soon.</p>}
      </div>

      {services && services.length > 0 && (
        <div>
          <SubHeading>Services</SubHeading>
          <div className="card-grid">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 0.1}>
                <div className="h-full rounded-2xl border border-line bg-surface p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-lg font-semibold">{s.name}</p>
                    <span className={`shrink-0 rounded-full border px-3 py-0.5 text-xs ${s.status === 'available' ? 'border-accent text-accent' : 'border-line text-muted'}`}>{s.status}</span>
                  </div>
                  {s.description && <p className="mt-2 text-sm text-muted">{s.description}</p>}
                  <p className="mt-4 text-xs uppercase tracking-widest text-muted">
                    {[s.category, s.price ? `From ₱${Number(s.price).toLocaleString()}` : '', s.delivery_days ? `${s.delivery_days} days` : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {certs && certs.length > 0 && (
        <div>
          <SubHeading>Certifications</SubHeading>
          <LoadMore items={certs}>
            {(c) => (
              <InfoCard
                image={c.image_url}
                title={c.name}
                meta={[c.issuing_organization, formatMonth(c.issue_date)].filter(Boolean).join(' · ')}
                description={c.description}
                href={c.credential_url}
                linkLabel="View credential"
              />
            )}
          </LoadMore>
        </div>
      )}

      {awards && awards.length > 0 && (
        <div>
          <SubHeading>Achievements</SubHeading>
          <LoadMore items={awards}>
            {(a) => (
              <InfoCard
                image={a.image_url}
                title={a.name}
                meta={[a.organization, formatMonth(a.achievement_date)].filter(Boolean).join(' · ')}
                description={a.description}
                href={a.url}
                linkLabel="Learn more"
              />
            )}
          </LoadMore>
        </div>
      )}
    </div>
  )
}
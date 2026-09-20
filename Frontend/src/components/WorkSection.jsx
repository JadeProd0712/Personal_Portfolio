import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useApi from '../hooks/useApi'
import { thumb } from '../lib/format'

const STEP = 3
const MAX_TAGS = 3
const HOME_LIMIT = 6

const initials = (title) =>
  title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function ProjectCard({ project, index }) {
  const target = project.live_url || project.repo_url
  const external = project.click_behavior === 'external' && target
  const cardClass =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-elevated active:scale-[0.98]'

  const tags = project.tech_list.slice(0, MAX_TAGS)
  const extra = project.tech_list.length - tags.length

  const content = (
    <>
      <div className="aspect-[16/10] shrink-0 overflow-hidden bg-elevated">
        {project.cover_image_url ? (
          <img
            src={thumb(project.cover_image_url, 640)}
            srcSet={`${thumb(project.cover_image_url, 480)} 480w, ${thumb(project.cover_image_url, 800)} 800w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-accent/60"
            style={{ backgroundImage: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 70%)' }}
          >
            {initials(project.title)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-muted">
          <span className="truncate">
            {String(index + 1).padStart(2, '0')}{project.category ? ` · ${project.category}` : ''}
          </span>
          <span className="shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1">
            {external ? '↗' : '→'}
          </span>
        </div>
        <h3 className="line-clamp-1 font-display text-xl font-semibold">{project.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-muted">{project.summary}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-muted">{t}</span>
          ))}
          {extra > 0 && (
            <span className="rounded-full border border-accent/40 px-3 py-1 text-xs text-accent">+{extra}</span>
          )}
        </div>
      </div>
    </>
  )

  return external ? (
    <a href={target} target="_blank" rel="noreferrer" className={cardClass}>{content}</a>
  ) : (
    <Link to={`/work/${project.slug}`} className={cardClass}>{content}</Link>
  )
}

export default function WorkSection({ featuredOnly = false }) {
  const { data, loading, error } = useApi('/projects/')
  const [category, setCategory] = useState('All')
  const [visible, setVisible] = useState(STEP)

  if (loading) return <p className="text-muted">Loading projects…</p>
  if (error) return <p className="text-muted">Projects could not be loaded right now.</p>
  if (!data || data.length === 0) return <p className="text-muted">Projects coming soon.</p>

  // Home: featured projects only (falls back to the newest ones if none are featured)
  const featured = data.filter((p) => p.is_featured)
  const pool = featuredOnly ? (featured.length ? featured : data).slice(0, HOME_LIMIT) : data
  const hasOthers = featuredOnly && data.length > pool.length

  const categories = ['All', ...new Set(pool.map((p) => p.category).filter(Boolean))]
  const filtered = category === 'All' ? pool : pool.filter((p) => p.category === category)
  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length

  const pick = (c) => {
    setCategory(c)
    setVisible(STEP)
  }

  const showLess = () => {
    setVisible(STEP)
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  }

  const btn =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm transition-colors hover:border-accent hover:text-accent sm:w-auto'

  return (
    <>
      {!featuredOnly && categories.length > 2 && (
        <div className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category === c ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div key={category} className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <motion.div
            key={p.id}
            className="h-full"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % STEP) * 0.12 }}
          >
            <ProjectCard project={p} index={i} />
          </motion.div>
        ))}
      </div>

      {filtered.length > STEP && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${(shown.length / filtered.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-muted">
            Showing {shown.length} of {filtered.length}
          </p>
          {remaining > 0 ? (
            <button onClick={() => setVisible((v) => v + STEP)} className={btn}>
              Show {Math.min(STEP, remaining)} more <span aria-hidden="true">↓</span>
            </button>
          ) : (
            <button onClick={showLess} className={btn}>
              Show less <span aria-hidden="true">↑</span>
            </button>
          )}
        </div>
      )}

      {hasOthers && (
        <div className="mt-8 flex justify-center">
          <Link to="/work" className={`${btn} border-accent/50 text-accent`}>
            View all projects <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </>
  )
}
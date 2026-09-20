import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../hooks/useApi'
import Reveal from '../components/Reveal'

function Block({ title, children }) {
  return (
    <Reveal>
      <div className="border-t border-line py-10">
        <h2 className="mb-4 text-sm uppercase tracking-widest text-accent">{title}</h2>
        {children}
      </div>
    </Reveal>
  )
}

const btnPrimary = 'rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90'
const btnGhost = 'rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { data: p, loading, error } = useApi(`/projects/${slug}/`)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 text-muted">Loading…</main>
  }

  if (error || !p) {
    return (
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <p className="text-sm uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Project not found</h1>
        <Link to="/" className="mt-6 inline-block text-muted hover:text-ink">← Back to home</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <Link to="/" className="text-sm text-muted transition-colors hover:text-accent">← Back</Link>

      <Reveal>
        <p className="mt-8 text-sm uppercase tracking-widest text-accent">{p.category || 'Project'}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-6xl">{p.title}</h1>
        {p.summary && <p className="mt-4 max-w-2xl text-lg text-muted">{p.summary}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className={btnPrimary}>Live demo ↗</a>}
          {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className={btnGhost}>GitHub ↗</a>}
          {p.extra_link_url && <a href={p.extra_link_url} target="_blank" rel="noreferrer" className={btnGhost}>{p.extra_link_label || 'Link'} ↗</a>}
        </div>
      </Reveal>

      {p.cover_image_url && (
        <Reveal className="mt-10">
          <img src={p.cover_image_url} alt={p.title} className="w-full rounded-2xl border border-line object-cover" />
        </Reveal>
      )}

      <div className="mt-10 grid gap-6 border-t border-line py-10 sm:grid-cols-2">
        {p.role && (
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Role</p>
            <p className="mt-2">{p.role}</p>
          </div>
        )}
        {p.tech_list.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Stack</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.tech_list.map((t) => (
                <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-muted">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {p.overview && <Block title="Overview"><p className="whitespace-pre-line text-muted">{p.overview}</p></Block>}
      {p.problem && <Block title="The problem"><p className="whitespace-pre-line text-muted">{p.problem}</p></Block>}
      {p.features_list.length > 0 && (
        <Block title="What I built">
          <ul className="space-y-2 text-muted">
            {p.features_list.map((f) => (
              <li key={f} className="flex gap-3"><span className="text-accent">→</span>{f}</li>
            ))}
          </ul>
        </Block>
      )}
      {p.images.length > 0 && (
        <Block title="Screenshots">
          <div className="grid gap-4 sm:grid-cols-2">
            {p.images.map((img) => (
              <img key={img.id} src={img.image_url} alt={img.alt_text || p.title} loading="lazy" className="w-full rounded-xl border border-line object-cover" />
            ))}
          </div>
        </Block>
      )}
      {p.challenges && <Block title="Challenges"><p className="whitespace-pre-line text-muted">{p.challenges}</p></Block>}
      {p.lessons && <Block title="What I learned"><p className="whitespace-pre-line text-muted">{p.lessons}</p></Block>}
    </main>
  )
}
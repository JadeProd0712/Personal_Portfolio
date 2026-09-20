import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import WorkSection from '../components/WorkSection'

export default function Work() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Projects'
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <Link to="/" className="text-sm text-muted transition-colors hover:text-accent">← Back</Link>

      <Reveal>
        <p className="mt-8 text-sm uppercase tracking-widest text-accent">All projects</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-6xl">Everything I&apos;ve built</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Browse every project. Use the categories to filter, and open any card to see the details.
        </p>
      </Reveal>

      {/* id="work" lets the "Show less" button scroll back up to the list */}
      <div id="work" className="mt-12 scroll-mt-24">
        <WorkSection />
      </div>
    </main>
  )
}
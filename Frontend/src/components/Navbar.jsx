import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import DownloadCv from './DownloadCv'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ profile }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const lockRef = useRef(false) 
  const lockTimer = useRef(null)
  const onHome = pathname === '/'

  const name = profile?.full_name || 'Your Name'
  const title = profile?.title || 'Full-Stack Developer'
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  

  // Blur + border after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy: the active link is the last section whose top has passed the reading line
  useEffect(() => {
    if (!onHome) {
      setActive('')
      return
    }
    const update = () => {
      if (lockRef.current) return
      const line = window.innerHeight * 0.35
      let current = ''
      LINKS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      })
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) current = LINKS[LINKS.length - 1].id
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [onHome])

  // Lock page scroll while the sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

    const goTo = (id) => {
    setOpen(false)
    setActive(id) // the underline moves right away when clicked
    lockRef.current = true
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      lockRef.current = false
      window.dispatchEvent(new Event('scroll')) // let the scroll tracking re-check
    }, 1300)

    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    if (onHome) {
      scroll()
    } else {
      navigate('/')
      setTimeout(scroll, 150)
    }
  }

  const goTop = () => {
    setOpen(false)
    if (onHome) window.scrollTo({ top: 0, behavior: 'smooth' })
    else navigate('/')
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button onClick={goTop} className="font-display text-lg font-bold tracking-tight">
            REDOTA<span className="text-accent">.</span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`relative py-1 text-sm transition-colors hover:text-ink ${
                  active === id ? 'text-accent' : 'text-muted'
                }`}
              >
                {label}
                {active === id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </button>
            ))}
            <DownloadCv variant="outline" />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Open menu"
          >
            <span className="h-0.5 w-6 bg-ink" />
            <span className="h-0.5 w-6 bg-ink" />
            <span className="h-0.5 w-4 self-end bg-ink" style={{ marginRight: 8 }} />
          </button>
        </nav>
      </header>

      {/* Mobile slide-out sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-line bg-surface p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <button
                onClick={() => setOpen(false)}
                className="mb-8 self-end text-2xl text-muted hover:text-ink"
                aria-label="Close menu"
              >
                ✕
              </button>

              <div className="mb-8 flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated font-display text-lg font-bold text-accent">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="font-display font-semibold">{name}</p>
                  <p className="text-sm text-muted">{title}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t border-line pt-6">
                {LINKS.map(({ id, label }, i) => (
                  <button
                    key={id}
                    onClick={() => goTo(id)}
                    className={`flex items-baseline gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-elevated ${
                      active === id ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    <span className="text-xs text-muted">0{i + 1}</span>
                    {label}
                  </button>
                ))}
              </div>

              <DownloadCv variant="solid" className="mt-auto w-full" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
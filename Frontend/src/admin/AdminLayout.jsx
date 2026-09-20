import { useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ADMIN_PATH, DASH_PATH, isLoggedIn, logout } from '../lib/adminApi'
import { RESOURCES } from './resources'

const NAV = [
  { to: DASH_PATH, label: 'Overview', end: true },
  ...Object.entries(RESOURCES).map(([key, r]) => ({ to: `${DASH_PATH}/${key}`, label: r.title })),
  { to: `${DASH_PATH}/messages`, label: 'Messages' },
]

function SideContent({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col p-5">
      <p className="mb-8 font-display text-lg font-bold">Admin<span className="text-accent">.</span></p>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-elevated text-accent' : 'text-muted hover:bg-elevated hover:text-ink'}`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
        <a href="/" target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-muted hover:text-ink">View site ↗</a>
        <button onClick={onLogout} className="block w-full rounded-lg px-3 py-2 text-left text-muted hover:text-red-400">Log out</button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!isLoggedIn()) return <Navigate to={ADMIN_PATH} replace />

  const onLogout = () => {
    logout()
    navigate(ADMIN_PATH, { replace: true })
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface md:block">
        <SideContent onLogout={onLogout} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-md md:hidden">
        <p className="font-display font-bold">Admin<span className="text-accent">.</span></p>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 flex-col items-center justify-center gap-1.5">
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-4 self-start bg-ink" style={{ marginLeft: 8 }} />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <SideContent onNavigate={() => setOpen(false)} onLogout={onLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
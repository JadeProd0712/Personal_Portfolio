import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastContext } from './toastContext'

const STYLE = {
  success: { ring: 'border-accent/40', badge: 'bg-accent/15 text-accent', icon: '✓', title: 'Done' },
  error: { ring: 'border-red-400/40', badge: 'bg-red-400/15 text-red-400', icon: '!', title: 'Something went wrong' },
  info: { ring: 'border-line', badge: 'bg-elevated text-muted', icon: 'i', title: 'Notice' },
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback((type, message, title) => {
    const id = ++counter.current
    const duration = type === 'error' ? 6000 : 3500
    setToasts((t) => [...t.slice(-3), { id, type, message, title, duration }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const api = useMemo(() => ({
    success: (message, title) => push('success', message, title),
    error: (message, title) => push('error', message, title),
    info: (message, title) => push('info', message, title),
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const s = STYLE[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                role="alert"
                onClick={() => dismiss(t.id)}
                initial={{ opacity: 0, y: -20, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`pointer-events-auto relative w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl border bg-surface/95 p-4 shadow-2xl backdrop-blur-md ${s.ring}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.badge}`}>{s.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.title || s.title}</p>
                    <p className="mt-0.5 break-words text-sm text-muted">{t.message}</p>
                  </div>
                </div>
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 ${t.type === 'error' ? 'bg-red-400' : 'bg-accent'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: t.duration / 1000, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
import { useState } from 'react'
import api from '../lib/api'
import Spinner from './ui/Spinner'
import { useToast } from './toastContext'

const STYLES = {
  outline: 'rounded-full border border-accent/50 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent hover:text-bg',
  solid: 'rounded-full px-4 py-3 text-sm font-semibold text-bg transition-transform active:scale-[0.98]',
}

export default function DownloadCv({ variant = 'outline', className = '' }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (busy) return
    setBusy(true)
    try {
      const { data } = await api.get('/resume/')
      const { downloadResume } = await import('../lib/generateResume.jsx')
      await downloadResume(data)
      toast.success('Your CV was downloaded.', 'Download ready')
    } catch (err) {
      console.error(err)
      toast.error('The CV could not be generated. Please try again.', 'Download failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      aria-busy={busy}
      style={variant === 'solid' ? { backgroundImage: 'linear-gradient(90deg, var(--color-accent), var(--accent-2, var(--color-accent)))' } : undefined}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70 ${STYLES[variant]} ${className}`}
    >
      {busy ? (
        <Spinner />
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
        </svg>
      )}
      {busy ? 'Preparing…' : 'Download CV'}
    </button>
  )
}
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { DASH_PATH, isLoggedIn, login } from '../lib/adminApi'
import { useToast } from '../components/toastContext'
import Button from '../components/ui/Button'

const field = 'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent'

export default function AdminLogin() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ username: '', password: '' })
  const [busy, setBusy] = useState(false)

  if (isLoggedIn()) return <Navigate to={DASH_PATH} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back.', 'Signed in')
      navigate(DASH_PATH, { replace: true })
    } catch (err) {
      const s = err.response?.status
      toast.error(
        s === 401 ? 'Wrong username or password.' : s === 429 ? 'Too many attempts. Try again later.' : 'Cannot reach the server.',
        'Sign in failed'
      )
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl font-bold">Admin<span className="text-accent">.</span></p>
        <p className="mb-8 mt-2 text-center text-sm text-muted">Sign in to manage your portfolio</p>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" autoComplete="username" required className={field} />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" autoComplete="current-password" required className={field} />
          <Button type="submit" loading={busy} className="w-full">{busy ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </div>
    </main>
  )
}
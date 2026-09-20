import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DASH_PATH, adminApi } from '../lib/adminApi'
import { RESOURCES } from './resources'

export default function Overview() {
  const [counts, setCounts] = useState({})
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    Object.entries(RESOURCES).forEach(([key, r]) => {
      if (r.single) return
      adminApi.get(`/${r.endpoint}/`).then((res) => setCounts((c) => ({ ...c, [key]: res.data.length }))).catch(() => {})
    })
    adminApi.get('/messages/').then((res) => setUnread(res.data.filter((m) => !m.is_read).length)).catch(() => {})
  }, [])

  const card = 'block rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/60 hover:bg-elevated'

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      <p className="mb-8 mt-2 text-muted">Everything you change here appears on your public site.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to={`${DASH_PATH}/messages`} className={card}>
          <p className="font-display text-4xl font-bold text-accent">{unread}</p>
          <p className="mt-1 text-sm text-muted">Unread messages</p>
        </Link>
        {Object.entries(RESOURCES).filter(([, r]) => !r.single).map(([key, r]) => (
          <Link key={key} to={`${DASH_PATH}/${key}`} className={card}>
            <p className="font-display text-4xl font-bold">{counts[key] ?? '–'}</p>
            <p className="mt-1 text-sm text-muted">{r.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
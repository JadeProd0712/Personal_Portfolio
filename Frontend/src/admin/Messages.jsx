import { useEffect, useState } from 'react'
import { adminApi, formatError } from '../lib/adminApi'
import { useToast } from '../components/toastContext'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Messages() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    adminApi.get('/messages/').then((r) => setItems(r.data)).catch((e) => { setItems([]); toast.error(formatError(e), 'Could not load messages') })
  }, [toast])

  const setRead = async (m, is_read) => {
    const res = await adminApi.patch(`/messages/${m.id}/`, { is_read })
    setItems((list) => list.map((x) => (x.id === m.id ? res.data : x)))
  }

  const toggleRead = async (m) => {
    setBusy(`read-${m.id}`)
    try { await setRead(m, !m.is_read) } catch (e) { toast.error(formatError(e)) } finally { setBusy(null) }
  }

  const toggle = (m) => {
    setOpen(open === m.id ? null : m.id)
    if (!m.is_read) setRead(m, true).catch(() => {})
  }

  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return
    setBusy(`del-${m.id}`)
    try {
      await adminApi.delete(`/messages/${m.id}/`)
      setItems((list) => list.filter((x) => x.id !== m.id))
      toast.success('Message deleted.')
    } catch (e) {
      toast.error(formatError(e), 'Could not delete')
    } finally {
      setBusy(null)
    }
  }

  if (items === null) return <p className="flex items-center gap-3 text-muted"><Spinner className="h-5 w-5 text-accent" /> Loading…</p>

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Messages</h1>
      {items.length === 0 ? (
        <p className="text-muted">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="rounded-xl border border-line bg-surface">
              <button onClick={() => toggle(m)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {!m.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
                    {m.sender_name} <span className="font-normal text-muted">· {m.subject || 'No subject'}</span>
                  </p>
                  <p className="text-xs text-muted">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <span className="text-muted">{open === m.id ? '−' : '+'}</span>
              </button>
              {open === m.id && (
                <div className="border-t border-line px-4 py-4 text-sm sm:px-5">
                  <p className="whitespace-pre-line break-words text-muted">{m.message}</p>
                  <p className="mt-4 break-all text-xs text-muted">{m.sender_email}{m.sender_phone && ` · ${m.sender_phone}`}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    <a href={`mailto:${m.sender_email}?subject=Re: ${m.subject || ''}`} className="text-accent">Reply by email</a>
                    <Button variant="textDanger" size="none" loading={busy === `read-${m.id}`} onClick={() => toggleRead(m)}>Mark {m.is_read ? 'unread' : 'read'}</Button>
                    <Button variant="textDanger" size="none" loading={busy === `del-${m.id}`} onClick={() => remove(m)}>Delete</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
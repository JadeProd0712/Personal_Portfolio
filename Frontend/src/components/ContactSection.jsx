import { useState } from 'react'
import api from '../lib/api'
import Reveal from './Reveal'
import Button from './ui/Button'
import { useToast } from './toastContext'

const field = 'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent'
const empty = { sender_name: '', sender_email: '', sender_phone: '', subject: '', message: '', website: '' }

export default function ContactSection({ profile }) {
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('idle')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await api.post('/contact/', form)
      setStatus('sent')
      setForm(empty)
      toast.success('Thank you, I will get back to you soon.', 'Message sent')
    } catch (err) {
      setStatus('idle')
      toast.error(
        err.response?.status === 429
          ? 'You have sent too many messages. Please try again later.'
          : 'Please check your details and try again.',
        'Message not sent'
      )
    }
  }

  return (
    <div className="grid gap-12 md:grid-cols-5">
      <Reveal className="md:col-span-2">
        <h3 className="font-display text-3xl font-bold leading-tight">Let&apos;s build something together.</h3>
        <p className="mt-4 text-muted">Have a project, an opportunity, or a question? Send me a message.</p>
        <div className="mt-6 space-y-2 text-sm">
          {profile?.public_email && <p><a href={`mailto:${profile.public_email}`} className="break-all text-accent">{profile.public_email}</a></p>}
          {profile?.github_url && <p><a href={profile.github_url} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">GitHub ↗</a></p>}
          {profile?.linkedin_url && <p><a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">LinkedIn ↗</a></p>}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="md:col-span-3">
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-8">
          {status === 'sent' ? (
            <div className="py-10 text-center">
              <p className="font-display text-2xl font-semibold text-accent">Message sent ✓</p>
              <p className="mt-2 text-muted">Thank you. I will get back to you soon.</p>
              <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-muted hover:text-ink">Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="sender_name" value={form.sender_name} onChange={update} placeholder="Your name" required maxLength={100} className={field} />
                <input name="sender_email" type="email" value={form.sender_email} onChange={update} placeholder="Your email" required maxLength={100} className={field} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="sender_phone" value={form.sender_phone} onChange={update} placeholder="Phone (optional)" maxLength={20} className={field} />
                <input name="subject" value={form.subject} onChange={update} placeholder="Subject" maxLength={150} className={field} />
              </div>
              <textarea name="message" value={form.message} onChange={update} placeholder="Your message" required rows={5} className={field} />

              {/* Honeypot: hidden from people, bots fill it in */}
              <input name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

              <Button type="submit" loading={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</Button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  )
}
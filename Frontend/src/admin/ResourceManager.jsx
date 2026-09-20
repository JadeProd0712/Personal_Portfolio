import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi, formatError } from '../lib/adminApi'
import { RESOURCES } from './resources'
import ProjectImages from './ProjectImages'
import ImageField from './ImageField'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/toastContext'

const control = 'w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent'

function Field({ f, value, onChange }) {
  if (f.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent" />
        {f.label}
      </label>
    )
  }
  const wide = f.type === 'textarea' || f.type === 'url' || f.type === 'image' || f.wide
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">{f.label}{f.required && ' *'}</label>
      {f.type === 'image' ? (
        <ImageField value={value} onChange={onChange} />
      ) : f.type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={5} className={control} />
      ) : f.type === 'select' ? (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={control}>
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type={f.type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required} step={f.type === 'number' ? 'any' : undefined} className={control} />
      )}
      {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
    </div>
  )
}

function Form({ config, item, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      config.fields.map((f) => {
        const fallback = f.default ?? (f.type === 'checkbox' ? false : f.type === 'select' ? f.options[0][0] : '')
        return [f.name, item ? item[f.name] ?? fallback : fallback]
      })
    )
  )
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const payload = {}
    config.fields.forEach((f) => {
      let v = values[f.name]
      if ((f.type === 'date' || f.type === 'number') && v === '') v = null
      if (f.name === 'slug' && !v) return
      payload[f.name] = v
    })
    try {
      const res = item
        ? await adminApi.patch(`/${config.endpoint}/${item.id}/`, payload)
        : await adminApi.post(`/${config.endpoint}/`, payload)
      toast.success(`${config.title === 'Profile' ? 'Profile' : 'Your ' + config.singular} was saved.`, 'Saved')
      onSaved(res.data)
    } catch (err) {
      toast.error(formatError(err), 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {config.fields.map((f) => (
          <Field key={f.name} f={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
        ))}
      </div>
      <Button type="submit" loading={saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </form>
  )
}

function Loading() {
  return (
    <p className="flex items-center gap-3 text-muted">
      <Spinner className="h-5 w-5 text-accent" /> Loading…
    </p>
  )
}

function Manager({ config }) {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(
    () =>
      adminApi
        .get(`/${config.endpoint}/`)
        .then((r) => { setItems(r.data); setFailed(false) })
        .catch((e) => { setFailed(true); toast.error(formatError(e), 'Could not load') }),
    [config.endpoint, toast]
  )
  useEffect(() => { load() }, [load])

  const current = config.single ? (items?.[0] ?? 'new') : editing

  const onSaved = (saved) => {
    load()
    if (config.hasImages) setEditing(saved)
    else if (!config.single) setEditing(null)
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete "${config.label(item)}"?`)) return
    setDeleting(item.id)
    try {
      await adminApi.delete(`/${config.endpoint}/${item.id}/`)
      toast.success('Deleted.')
      await load()
    } catch (e) {
      toast.error(formatError(e), 'Could not delete')
    } finally {
      setDeleting(null)
    }
  }

  if (items === null) {
    return failed ? <Button variant="ghost" size="sm" onClick={load}>Try again</Button> : <Loading />
  }

  if (current) {
    return (
      <div>
        {!config.single && (
          <button onClick={() => setEditing(null)} className="mb-6 text-sm text-muted hover:text-ink">← Back to {config.title}</button>
        )}
        <h1 className="mb-6 font-display text-3xl font-bold">
          {config.single ? config.title : current === 'new' ? `New ${config.singular}` : `Edit ${config.singular}`}
        </h1>
        <Form key={current === 'new' ? 'new' : current.id} config={config} item={current === 'new' ? null : current} onSaved={onSaved} />
        {config.hasImages && current !== 'new' && <ProjectImages projectId={current.id} />}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">{config.title}</h1>
        <Button size="sm" onClick={() => setEditing('new')}>+ Add {config.singular}</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {config.label(it)}
                  {it.is_visible === false && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs text-muted">Hidden</span>}
                </p>
                {config.meta && <p className="truncate text-xs text-muted">{config.meta(it)}</p>}
              </div>
              <div className="flex shrink-0 gap-4">
                <Button variant="text" size="none" onClick={() => setEditing(it)}>Edit</Button>
                <Button variant="textDanger" size="none" loading={deleting === it.id} onClick={() => remove(it)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ResourcePage() {
  const { resource } = useParams()
  const config = RESOURCES[resource]
  if (!config) return <p className="text-muted">Unknown section.</p>
  return <Manager key={resource} config={config} />
}
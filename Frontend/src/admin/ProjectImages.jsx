import { useCallback, useEffect, useRef, useState } from 'react'
import { adminApi, formatError } from '../lib/adminApi'
import { useToast } from '../components/toastContext'
import Button from '../components/ui/Button'

const MAX = 5 * 1024 * 1024

export default function ProjectImages({ projectId }) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(
    () => adminApi.get(`/project-images/?project=${projectId}`).then((r) => setImages(r.data)).catch((e) => toast.error(formatError(e), 'Could not load screenshots')),
    [projectId, toast]
  )
  useEffect(() => { load() }, [load])

  const onFiles = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    let ok = 0
    for (const file of files) {
      if (file.size > MAX) {
        toast.error(`${file.name} is over 5 MB.`, 'Skipped')
        continue
      }
      try {
        const fd = new FormData()
        fd.append('file', file)
        const { data } = await adminApi.post('/upload/', fd)
        await adminApi.post('/project-images/', {
          project: projectId,
          image_url: data.url,
          alt_text: file.name.replace(/\.[^.]+$/, ''),
          display_order: images.length + ok,
        })
        ok++
      } catch (err) {
        toast.error(formatError(err), `Failed: ${file.name}`)
      }
    }
    setUploading(false)
    if (ok) {
      toast.success(`${ok} screenshot${ok > 1 ? 's' : ''} added.`)
      load()
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this screenshot?')) return
    setDeleting(id)
    try {
      await adminApi.delete(`/project-images/${id}/`)
      toast.success('Screenshot deleted.')
      load()
    } catch (err) {
      toast.error(formatError(err), 'Could not delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="mt-12 border-t border-line pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm uppercase tracking-widest text-accent">Screenshots</h2>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={onFiles} className="hidden" />
        <Button type="button" variant="ghost" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading…' : '+ Upload screenshots'}
        </Button>
      </div>
      {images.length === 0 ? (
        <p className="text-sm text-muted">No screenshots yet. You can select several at once.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <img src={img.image_url} alt={img.alt_text} loading="lazy" className="aspect-video w-full object-cover" />
              <div className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="truncate text-muted">{img.alt_text || `Image ${img.id}`}</span>
                <Button type="button" variant="textDanger" size="none" loading={deleting === img.id} onClick={() => remove(img.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
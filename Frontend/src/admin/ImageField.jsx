import { useRef, useState } from 'react'
import { adminApi, formatError } from '../lib/adminApi'
import { useToast } from '../components/toastContext'
import Button from '../components/ui/Button'

export default function ImageField({ value, onChange }) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const upload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.', 'File too large')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await adminApi.post('/upload/', fd)
      onChange(res.data.url)
      toast.success('Image uploaded. Press Save to keep it.')
    } catch (err) {
      toast.error(formatError(err), 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {value && <img src={value} alt="Preview" className="aspect-[16/10] w-full max-w-sm rounded-xl border border-line object-cover" />}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload an image, or paste a link"
          className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} className="hidden" />
        <Button type="button" variant="ghost" size="sm" loading={uploading} onClick={() => inputRef.current?.click()} className="shrink-0">
          {uploading ? 'Uploading…' : 'Upload image'}
        </Button>
        {value && <Button type="button" variant="textDanger" size="none" onClick={() => onChange('')}>Remove</Button>}
      </div>
    </div>
  )
}
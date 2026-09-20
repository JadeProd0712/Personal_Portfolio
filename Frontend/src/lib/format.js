export function formatMonth(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

// Ask Cloudinary for a small 16:10 version of an image (cards only).
// Non-Cloudinary links (like your GitHub avatar) are returned unchanged.
export function thumb(url, width = 640) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  const t = `f_auto,q_auto,c_fill,w_${width},h_${Math.round(width * 0.625)}`
  return url.includes('/upload/f_auto,q_auto/')
    ? url.replace('/upload/f_auto,q_auto/', `/upload/${t}/`)
    : url.replace('/upload/', `/upload/${t}/`)
}

// Resized but NOT cropped (for certificates and other documents)
export function small(url, width = 800) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  const t = `f_auto,q_auto,w_${width}`
  return url.includes('/upload/f_auto,q_auto/')
    ? url.replace('/upload/f_auto,q_auto/', `/upload/${t}/`)
    : url.replace('/upload/', `/upload/${t}/`)
}
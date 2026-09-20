import { useEffect } from 'react'

// ----- Default "neon on black" theme (change these two colors to restyle the default) -----
export const DEFAULT_THEME = { accent: '#38F2A5', accent2: '#3EDCF5' }

// Keep in sync with --color-bg in index.css. Used to keep the accent readable.
const BG = '#14161A'
const CACHE_KEY = 'portfolio-theme-v1'

/* ---------------- color helpers ---------------- */

function hslToRgb(h, s, l) {
  const k = (n) => (n + ((h % 360) + 360) % 360 / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255))
}

const toHex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Turn a hue into a bright "neon" color that stays readable on the dark background
function neon(hue) {
  const bg = hexToRgb(BG)
  let l = 0.62
  let rgb = hslToRgb(hue, 0.95, l)
  while (contrast(rgb, bg) < 4.6 && l < 0.82) {
    l += 0.02
    rgb = hslToRgb(hue, 0.95, l)
  }
  return toHex(rgb)
}

function themeFromHue(hue) {
  // second color for gradients: a neighbouring hue (towards blue for violets/blues)
  const shift = hue >= 180 && hue < 300 ? -28 : 28
  return { accent: neon(hue), accent2: neon(hue + shift) }
}

/* ---------------- dominant hue ---------------- */

function dominantHue(img) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size) // throws if the image blocks CORS

  const BINS = 36
  const bins = Array.from({ length: BINS }, () => ({ w: 0, x: 0, y: 0 }))
  let total = 0
  let vivid = 0

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    total++

    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    const v = max
    const s = max === 0 ? 0 : d / max

    if (v < 0.25 || s < 0.35) continue // too dark, or white/grey

    let h = 0
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360

    if (h >= 8 && h <= 40 && s < 0.65) continue // skin tones / wood, not a "theme" color

    const w = s * s * v // favour vivid, bright pixels
    const rad = (h * Math.PI) / 180
    const bin = bins[Math.floor(h / (360 / BINS)) % BINS]
    bin.w += w
    bin.x += Math.cos(rad) * w
    bin.y += Math.sin(rad) * w
    vivid++
  }

  // Not enough color in the picture -> no dominant hue
  if (!total || vivid / total < 0.03) return null

  // Strongest hue neighbourhood (a bin plus its two neighbours)
  let best = 0
  let bestW = -1
  for (let i = 0; i < BINS; i++) {
    const w = bins[i].w + bins[(i + 1) % BINS].w + bins[(i + BINS - 1) % BINS].w
    if (w > bestW) {
      bestW = w
      best = i
    }
  }
  const group = [best - 1, best, best + 1].map((i) => bins[(i + BINS) % BINS])
  const x = group.reduce((sum, b) => sum + b.x, 0)
  const y = group.reduce((sum, b) => sum + b.y, 0)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

/* ---------------- apply + cache ---------------- */

function applyTheme({ accent, accent2 }) {
  const root = document.documentElement
  root.style.setProperty('--color-accent', accent)
  root.style.setProperty('--accent-2', accent2)
}

function saveTheme(url, theme) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ url, ...theme }))
  } catch { /* storage unavailable, ignore */ }
}

// Apply the last known theme immediately on page load so there is no color flash
;(function applyInitialTheme() {
  let theme = DEFAULT_THEME
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached?.accent && cached?.accent2) theme = cached
  } catch { /* ignore */ }
  applyTheme(theme)
})()

export default function useAvatarTheme(url) {
  useEffect(() => {
    if (!url) return
    let cancelled = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      let theme = DEFAULT_THEME
      try {
        const hue = dominantHue(img)
        if (hue !== null) theme = themeFromHue(hue)
      } catch {
        // Canvas is blocked (image server has no CORS): fall back to the default theme
      }
      applyTheme(theme)
      saveTheme(url, theme)
    }
    img.onerror = () => {
      console.warn('Avatar color could not be read (image blocks CORS). Using the default theme.')
      if (!cancelled) applyTheme(DEFAULT_THEME)
    }
    img.src = url

    return () => { cancelled = true }
  }, [url])
}
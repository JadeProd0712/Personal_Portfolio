import axios from 'axios'

const base = import.meta.env.VITE_API_URL
export const ADMIN_PATH = '/' + (import.meta.env.VITE_ADMIN_PATH || 'manage-x7k2p')
export const DASH_PATH = `${ADMIN_PATH}/panel`

export const isLoggedIn = () => !!localStorage.getItem('refresh')

export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export async function login(username, password) {
  const res = await axios.post(`${base}/auth/login/`, { username, password })
  localStorage.setItem('access', res.data.access)
  localStorage.setItem('refresh', res.data.refresh)
}

export const adminApi = axios.create({ baseURL: `${base}/manage` })

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const refresh = localStorage.getItem('refresh')
    if (err.response?.status === 401 && !original._retry && refresh) {
      original._retry = true
      try {
        const res = await axios.post(`${base}/auth/refresh/`, { refresh })
        localStorage.setItem('access', res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return adminApi(original)
      } catch {
        logout()
        window.location.href = ADMIN_PATH
      }
    }
    return Promise.reject(err)
  }
)

export function formatError(err) {
  const data = err.response?.data
  if (!data) return 'Network error. Is Django running?'
  if (typeof data === 'string') return 'Request failed.'
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
    .join(' | ')
}
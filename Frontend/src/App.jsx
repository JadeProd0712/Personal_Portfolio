import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Work from './pages/Work'
import ProjectDetail from './pages/ProjectDetail'
import useSmoothScroll from './hooks/useSmoothScroll'
import useApi from './hooks/useApi'
import useAvatarTheme from './hooks/useAvatarTheme'
import { ADMIN_PATH, DASH_PATH } from './lib/adminApi'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Overview from './admin/Overview'
import Messages from './admin/Messages'
import ResourcePage from './admin/ResourceManager'

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold">Page not found</h1>
      <Link to="/" className="mt-6 text-muted hover:text-ink">Go back home</Link>
    </main>
  )
}

export default function App() {
  useSmoothScroll()
  const { data: profile } = useApi('/profile/')
  useAvatarTheme(profile?.avatar_url)
  const { pathname } = useLocation()
  const inAdmin = pathname.startsWith(ADMIN_PATH)

  useEffect(() => {
    if (inAdmin) document.title = 'Admin'
    else if (pathname === '/' && profile?.full_name) {
    document.title = 'REDOTA | Portfolio'
    }
  }, [pathname, inAdmin, profile])

  return (
    <>
      {!inAdmin && <Navbar profile={profile} />}
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />

        <Route path={ADMIN_PATH} element={<AdminLogin />} />
        <Route path={DASH_PATH} element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="messages" element={<Messages />} />
          <Route path=":resource" element={<ResourcePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
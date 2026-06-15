import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '@/store'
import Layout from '@/components/layout/Layout'
import LoadingScreen from '@/components/common/LoadingScreen'

// Lazy loaded pages
const Home = lazy(() => import('@/pages/Home'))
const WebtoonList = lazy(() => import('@/pages/webtoon/WebtoonList'))
const WebtoonDetail = lazy(() => import('@/pages/webtoon/WebtoonDetail'))
const WebtoonReader = lazy(() => import('@/pages/webtoon/WebtoonReader'))
const AnimeHome = lazy(() => import('@/pages/anime/AnimeHome'))
const AnimeDetail = lazy(() => import('@/pages/anime/AnimeDetail'))
const VideoPlayer = lazy(() => import('@/pages/anime/VideoPlayer'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const Profile = lazy(() => import('@/pages/Profile'))
const Bookmarks = lazy(() => import('@/pages/Bookmarks'))
const Search = lazy(() => import('@/pages/Search'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth pages - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main app with layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/webtoons" element={<WebtoonList />} />
          <Route path="/webtoons/:slug" element={<WebtoonDetail />} />
          <Route path="/anime" element={<AnimeHome />} />
          <Route path="/anime/:slug" element={<AnimeDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Route>

        {/* Full screen reader / player */}
        <Route path="/read/:slug/:episode" element={<WebtoonReader />} />
        <Route path="/watch/:slug/:episode" element={<VideoPlayer />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

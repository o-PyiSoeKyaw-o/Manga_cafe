import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Sun, Moon, Bell, Coins, Menu, Globe, User, LogOut, Bookmark, LayoutDashboard, X } from 'lucide-react'
import { useAuthStore, useThemeStore, useLangStore, useUIStore } from '@/store'
import toast from 'react-hot-toast'
import { authAPI } from '@/utils/api'
import LiveSearch from '@/components/common/LiveSearch'
import { coinAPI } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'my', label: 'မြန်မာ' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

function WalletBalance() {
  const { isAuthenticated } = useAuthStore()
  const { data } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => coinAPI.getWallet().then(r => r.data.balance),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  })
  return data ?? '...'
}

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, accessToken } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useLangStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const userMenuRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await authAPI.logout(useAuthStore.getState().refreshToken)
    } catch (_) {}
    logout()
    toast.success(t('auth.logout_success'))
    navigate('/')
  }

  const handleLangChange = (code) => {
    setLanguage(code)
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center px-4 gap-3">
        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2">
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 shrink-0">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">MC</span>
          </div>
          <span className="font-extrabold text-lg hidden sm:block">
            <span className="text-primary-400">Manga</span>
            <span className="text-[var(--color-text)]">Cafe</span>
          </span>
        </Link>

        {/* Nav links - desktop */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/webtoons', label: t('nav.webtoons') },
            { to: '/anime', label: t('nav.anime') },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search button */}
        <button onClick={() => setSearchOpen(true)} className="btn-ghost p-2" title={t('nav.search')}>
          <Search size={20} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-ghost p-2" title={theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language */}
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="btn-ghost p-2">
            <Globe size={20} />
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-2 card w-36 py-1 shadow-xl z-50">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors ${language === l.code ? 'text-primary-400 font-semibold' : 'text-[var(--color-text)]'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <>
            {/* Coin balance */}
            <Link to="/dashboard" className="coin-badge hidden sm:flex">
              <Coins size={12} />
              <span><WalletBalance /></span>
            </Link>

            {/* Notifications */}
            <button className="btn-ghost p-2 relative">
              <Bell size={20} />
            </button>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
                {user?.avatar
                  ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt={user.username} />
                  : <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">{user?.username?.[0]?.toUpperCase()}</div>
                }
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 card w-48 py-1 shadow-xl z-50">
                  <div className="px-4 py-2 border-b border-[var(--color-border)]">
                    <p className="font-semibold text-sm">{user?.username}</p>
                    <p className="text-xs text-[var(--color-muted)] truncate">{user?.email}</p>
                  </div>
                  {[
                    { to: `/profile/${user?.username}`, icon: User, label: t('nav.profile') },
                    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
                    { to: '/bookmarks', icon: Bookmark, label: t('nav.bookmarks') },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors">
                      <Icon size={16} />{label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                    <LogOut size={16} />{t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm px-3 py-1.5">{t('nav.login')}</Link>
            {/* <Link to="/register" className="btn-primary text-sm px-3 py-1.5">{t('nav.signup')}</Link> */}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && <LiveSearch onClose={() => setSearchOpen(false)} />}
    </>
  )
}

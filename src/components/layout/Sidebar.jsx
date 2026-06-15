import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, BookOpen, Tv, LayoutDashboard, Bookmark, History, Coins, Settings } from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', icon: Home, labelKey: 'nav.home' },
  { to: '/webtoons', icon: BookOpen, labelKey: 'nav.webtoons' },
  { to: '/anime', icon: Tv, labelKey: 'nav.anime' },
]

const AUTH_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/bookmarks', icon: Bookmark, labelKey: 'nav.bookmarks' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { sidebarOpen } = useUIStore()
  const { isAuthenticated } = useAuthStore()

  const isActive = (path) => location.pathname === path

  return (
    <aside className={clsx(
      'fixed left-0 top-16 bottom-0 z-40 bg-[var(--color-bg)] border-r border-[var(--color-border)] transition-all duration-300 flex flex-col',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
            <Link key={to} to={to}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                isActive(to)
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
              )}>
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{t(labelKey)}</span>}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className={clsx('my-3 border-t border-[var(--color-border)]', !sidebarOpen && 'mx-2')} />
              {AUTH_ITEMS.map(({ to, icon: Icon, labelKey }) => (
                <Link key={to} to={to}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isActive(to)
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
                  )}>
                  <Icon size={20} className="shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{t(labelKey)}</span>}
                </Link>
              ))}
            </>
          )}
        </div>
      </nav>
    </aside>
  )
}

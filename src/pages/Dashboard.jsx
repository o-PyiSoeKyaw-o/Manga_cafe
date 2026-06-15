import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Tv, Eye, Heart, Coins, TrendingUp, Upload, Plus, BarChart3, Users, History } from 'lucide-react'
import { dashboardAPI, coinAPI } from '@/utils/api'
import { useAuthStore } from '@/store'
import { Spinner } from '@/components/common/LoadingScreen'
import SeriesCard from '@/components/common/SeriesCard'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-500/15 text-primary-400',
    orange: 'bg-orange-500/15 text-orange-400',
    green: 'bg-green-500/15 text-green-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
  }
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[var(--color-muted)] text-xs">{label}</p>
        <p className="text-xl font-bold">{value?.toLocaleString?.() ?? value ?? '—'}</p>
      </div>
    </div>
  )
}

function AuthorDashboard({ data }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={18} className="text-primary-400" />{t('nav.webtoons')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <StatCard icon={BookOpen} label="Series" value={data.webtoon.total_series} />
          <StatCard icon={Eye} label={t('dashboard.total_views')} value={data.webtoon.total_views} color="orange" />
          <StatCard icon={Heart} label={t('dashboard.total_likes')} value={data.webtoon.total_likes} color="green" />
          <StatCard icon={TrendingUp} label="Episodes" value={data.webtoon.total_episodes} color="yellow" />
        </div>
        {data.webtoon.series.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.webtoon.series.map(s => <div key={s.id} className="shrink-0"><SeriesCard series={s} type="webtoon" size="sm" /></div>)}
          </div>
        )}
        <Link to="/webtoons/series/create" className="btn-primary mt-4 inline-flex items-center gap-2"><Plus size={16} />{t('dashboard.create_series')}</Link>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Tv size={18} className="text-orange-400" />{t('nav.anime')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <StatCard icon={Tv} label="Series" value={data.anime.total_series} color="orange" />
          <StatCard icon={Eye} label={t('dashboard.total_views')} value={data.anime.total_views} />
          <StatCard icon={Heart} label={t('dashboard.total_likes')} value={data.anime.total_likes} color="green" />
        </div>
        {data.anime.series.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.anime.series.map(s => <div key={s.id} className="shrink-0"><SeriesCard series={s} type="anime" size="sm" /></div>)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Coins size={18} className="text-yellow-400" />{t('coins.balance')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Coins} label="Balance" value={data.coins.balance} color="yellow" />
          <StatCard icon={TrendingUp} label={t('coins.earned')} value={data.coins.total_earned} color="green" />
          <StatCard icon={BarChart3} label={t('coins.spent')} value={data.coins.total_spent} color="orange" />
        </div>
      </div>
    </div>
  )
}

function ReaderDashboard({ data }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Bookmarks" value={data.bookmark_count} />
        <StatCard icon={Coins} label={t('dashboard.coin_balance')} value={data.coin_balance} color="yellow" />
      </div>

      {data.reading_history?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><History size={18} />{t('dashboard.reading_history')}</h2>
          <div className="space-y-3">
            {data.reading_history.map((h) => (
              <div key={h.id} className="card flex gap-3 p-3">
                <img src={h.series.cover_image} alt={h.series.title} className="w-12 h-16 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{h.series.title}</p>
                  {h.last_episode && <p className="text-xs text-[var(--color-muted)]">Last: Ep {h.last_episode.episode_number}</p>}
                  <div className="mt-2 h-1 bg-[var(--color-border)] rounded-full">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${h.progress || 0}%` }} />
                  </div>
                </div>
                {h.last_episode && (
                  <Link to={`/read/${h.series.slug}/${h.last_episode.episode_number}`} className="btn-primary text-xs px-3 py-1 shrink-0 self-center">
                    {t('home.continue_reading')}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.watch_history?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Tv size={18} className="text-orange-400" />{t('dashboard.watch_history')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.watch_history.map((h) => (
              <div key={h.id} className="shrink-0">
                <SeriesCard series={h.series} type="anime" size="md" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [tab, setTab] = useState(user?.role === 'author' || user?.role === 'admin' ? 'author' : 'reader')

  const { data: authorData, isLoading: loadingAuthor } = useQuery({
    queryKey: ['author-dashboard'],
    queryFn: () => dashboardAPI.getAuthorDashboard().then(r => r.data),
    enabled: tab === 'author',
  })

  const { data: readerData, isLoading: loadingReader } = useQuery({
    queryKey: ['reader-dashboard'],
    queryFn: () => dashboardAPI.getReaderDashboard().then(r => r.data),
    enabled: tab === 'reader',
  })

  const loading = tab === 'author' ? loadingAuthor : loadingReader

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
          <p className="text-[var(--color-muted)] text-sm">Welcome back, {user?.username}</p>
        </div>
        <Link to="/bookmarks" className="btn-secondary flex items-center gap-2 text-sm">
          <BookOpen size={16} />{t('nav.bookmarks')}
        </Link>
      </div>

      {/* Tab switch */}
      <div className="flex gap-1 mb-8 border-b border-[var(--color-border)]">
        {[
          { key: 'reader', icon: BookOpen, label: 'Reader' },
          { key: 'author', icon: Upload, label: 'Creator' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : tab === 'author' ? (
        authorData ? <AuthorDashboard data={authorData} /> : null
      ) : (
        readerData ? <ReaderDashboard data={readerData} /> : null
      )}
    </div>
  )
}

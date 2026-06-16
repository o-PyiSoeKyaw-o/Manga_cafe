import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { webtoonAPI, animeAPI } from '@/utils/api'
import SeriesCard from '@/components/common/SeriesCard'
import { CardSkeleton } from '@/components/common/LoadingScreen'
import { useOnlineStatus } from '@/hooks/useDebounce'
import { OfflineBanner } from '@/components/common/LoadingScreen'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'completed']
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun', completed: 'Done' }
const TODAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

function HorizontalScroll({ children, title, viewAllTo }) {
  return (
    <section className="mb-10">
      <div className="flex-wrap flex items-center justify-between mb-4 px-4 lg:px-6">
        <h2 className="section-title mb-0">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View all <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="px-4 lg:px-6 overflow-x-auto scroll-snap-x pb-2 flex gap-4 scrollbar-none">
        {children}
      </div>
    </section>
  )
}

function TrendingSection() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('trending')
  const { data: trending, isLoading: loadingT } = useQuery({ queryKey: ['trending'], queryFn: () => webtoonAPI.getTrending().then(r => r.data) })
  const { data: popular, isLoading: loadingP } = useQuery({ queryKey: ['popular'], queryFn: () => webtoonAPI.getPopular().then(r => r.data) })

  const series = tab === 'trending' ? trending : popular
  const loading = tab === 'trending' ? loadingT : loadingP

  return (
    <section className="mb-10">
      <div className="flex items-center gap-4 mb-4 px-4 lg:px-6">
        <h2 className="section-title mb-0">{t('home.trending')}</h2>
        <div className="flex gap-1 ml-4">
          {['trending', 'popular'].map((t_) => (
            <button key={t_} onClick={() => setTab(t_)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === t_ ? 'bg-[var(--color-text)] text-[var(--color-bg)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
              {t_ === 'trending' ? t('home.trending').split(' ')[0] : t('home.popular')}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 lg:px-6 overflow-x-auto pb-2 flex gap-4 scroll-snap-x">
        {loading ? <CardSkeleton count={6} /> :
          series?.map((s, i) => (
            <div key={s.id} className="scroll-snap-item shrink-0 relative">
              <span className="absolute -top-1 -left-1 z-10 text-5xl font-black text-[var(--color-text)] opacity-50 leading-none select-none">{i + 1}</span>
              <div className="mt-4">
                <SeriesCard series={s} type="webtoon" size="md" />
              </div>
            </div>
          ))
        }
      </div>
    </section>
  )
}

function DailySchedule() {
  const { t } = useTranslation()
  const [activeDay, setActiveDay] = useState(TODAY)
  const { data, isLoading } = useQuery({
    queryKey: ['schedule', activeDay],
    queryFn: () => webtoonAPI.getBySchedule(activeDay).then(r => r.data),
  })

  return (
    <section className="mb-10 px-4 lg:px-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">{t('home.daily')}</h2>
        <Link to="/webtoons" className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
          {t('home.view_all')} <ChevronRight size={14} />
        </Link>
      </div>

      {/* Day tabs */}
      <div className="flex flex-wrap gap-2 mb-5 overflow-x-auto pb-1">
        {DAYS.map((day) => (
          <button key={day} onClick={() => setActiveDay(day)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeDay === day
                ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                : 'bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
            } ${day === TODAY && activeDay !== day ? 'ring-1 ring-primary-500' : ''}`}>
            {DAY_LABELS[day]}
            {day === TODAY && <span className="ml-1 w-1.5 h-1.5 bg-primary-400 rounded-full inline-block" />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto flex gap-4 pb-2">
        {isLoading ? <CardSkeleton count={6} /> :
          data?.map((s) => (
            <div key={s.id} className="scroll-snap-item shrink-0">
              <SeriesCard series={s} type="webtoon" size="md" badge={s.has_new_episode ? 'New' : null} />
            </div>
          ))
        }
        {!isLoading && data?.length === 0 && (
          <p className="text-[var(--color-muted)] text-sm py-8">No series scheduled for this day</p>
        )}
      </div>
    </section>
  )
}

function AnimeSpotlight() {
  const { t } = useTranslation()
  const { data: featured, isLoading } = useQuery({
    queryKey: ['anime-featured'],
    queryFn: () => animeAPI.getFeatured().then(r => r.data),
  })

  if (isLoading || !featured?.length) return null

  const hero = featured[0]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-6">
        <h2 className="section-title mb-0">{t('anime.now_streaming')}</h2>
        <Link to="/anime" className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
          {t('home.view_all')} <ChevronRight size={14} />
        </Link>
      </div>

      {/* Hero card - Netflix style */}
      <div className="relative h-64 sm:h-80 mx-4 lg:mx-6 rounded-2xl overflow-hidden mb-6 cursor-pointer group">
        <img src={hero.banner || hero.thumbnail} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="flex gap-2 mb-2">
            {hero.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="tag bg-white/20 text-white text-[10px]">{g.name}</span>
            ))}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 drop-shadow">{hero.title}</h3>
          <p className="text-white/70 text-sm line-clamp-2 max-w-md mb-4">{hero.description}</p>
          <Link to={`/anime/${hero.slug}`} className="btn-primary w-fit">{t('anime.watch')}</Link>
        </div>
      </div>

      {/* Rest as cards */}
      <div className="px-4 lg:px-6 overflow-x-auto flex gap-4 pb-2">
        {featured.slice(1).map((s) => (
          <div key={s.id} className="scroll-snap-item shrink-0">
            <SeriesCard series={s} type="anime" size="lg" />
          </div>
        ))}
      </div>
    </section>
  )
}

function CategorySection() {
  const { t } = useTranslation()
  const [activeGenre, setActiveGenre] = useState(null)
  const { data: genres } = useQuery({ queryKey: ['genres'], queryFn: () => webtoonAPI.getGenres().then(r => r.data) })
  const { data: series, isLoading } = useQuery({
    queryKey: ['series-by-genre', activeGenre],
    queryFn: () => webtoonAPI.getSeries({ genre: activeGenre, ordering: 'popular', page_size: 8 }).then(r => r.data.results),
  })

  return (
    <section className="mb-10 px-4 lg:px-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">{t('home.by_category')}</h2>
        <Link to="/webtoons" className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
          {t('home.view_all')} <ChevronRight size={14} />
        </Link>
      </div>

      {/* Genre pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setActiveGenre(null)} className={`genre-pill shrink-0 ${!activeGenre ? 'active' : ''}`}>All</button>
        {genres?.map((g) => (
          <button key={g.id} onClick={() => setActiveGenre(g.slug)} className={`genre-pill shrink-0 ${activeGenre === g.slug ? 'active' : ''}`}>{g.name}</button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {isLoading ? <CardSkeleton count={6} /> :
          series?.map((s) => (
            <div key={s.id} className="scroll-snap-item shrink-0">
              <SeriesCard series={s} type="webtoon" size="md" showStats />
            </div>
          ))
        }
      </div>
    </section>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const { data: newOriginals, isLoading: loadingNew } = useQuery({
    queryKey: ['new-originals'],
    queryFn: () => webtoonAPI.getSeries({ ordering: 'new', is_original: true, page_size: 10 }).then(r => r.data.results),
  })

  return (
    <div className="pb-20 animate-fade-in">
      {!isOnline && <OfflineBanner />}

      {/* Trending */}
      <TrendingSection />

      {/* Anime spotlight - Netflix style */}
      <AnimeSpotlight />

      {/* Newly Released Originals */}
      <HorizontalScroll title={t('home.new_originals')} viewAllTo="/webtoons?filter=original">
        {loadingNew ? <CardSkeleton count={6} /> :
          newOriginals?.map((s) => (
            <div key={s.id} className="scroll-snap-item shrink-0">
              <SeriesCard series={s} type="webtoon" size="lg" badge="New" />
            </div>
          ))
        }
      </HorizontalScroll>

      {/* Category section */}
      <CategorySection />

      {/* Daily schedule */}
      <DailySchedule />
    </div>
  )
}

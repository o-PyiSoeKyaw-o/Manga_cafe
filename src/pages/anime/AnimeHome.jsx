import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Play, ChevronRight, TrendingUp } from 'lucide-react'
import { animeAPI } from '@/utils/api'
import SeriesCard from '@/components/common/SeriesCard'
import { CardSkeleton, Spinner } from '@/components/common/LoadingScreen'


function HeroBanner({ series }) {
  const { t } = useTranslation()
  if (!series) return null
  return (
    <div className="relative h-80 sm:h-[500px] overflow-hidden">
      <img src={series.banner || series.thumbnail} alt={series.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
      <div className="absolute bottom-12 left-6 max-w-xl">
        <div className="flex gap-2 mb-3">
          {series.genres?.slice(0, 3).map(g => (
            <span key={g.id} className="tag bg-white/20 text-white text-xs">{g.name}</span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-3 drop-shadow-xl">{series.title}</h1>
        <p className="text-white/70 text-sm sm:text-base line-clamp-2 mb-5 max-w-md">{series.description}</p>
        <div className="flex gap-3">
          <Link to={`/anime/${series.slug}`} className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            <Play size={18} fill="white" /> {t('anime.watch')}
          </Link>
          <Link to={`/anime/${series.slug}`} className="btn-secondary flex items-center gap-2 text-base px-6 py-3">More Info</Link>
        </div>
      </div>
    </div>
  )
}

function RowSection({ title, series, loading, viewAllTo }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-4 lg:px-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
            See all <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="px-4 lg:px-6 flex gap-4 overflow-x-auto pb-3">
        {loading ? <CardSkeleton count={6} type="anime" /> :
          series?.map(s => (
            <div key={s.id} className="shrink-0 scroll-snap-item">
              <SeriesCard series={s} type="anime" size="lg" />
            </div>
          ))
        }
      </div>
    </section>
  )
}

export default function AnimeHome() {
  const { t } = useTranslation()
  const [genre, setGenre] = useState('')
  const [allSeries, setAllSeries] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)

  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['anime-featured'],
    queryFn: () => animeAPI.getFeatured().then(r => r.data),
  })
  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['anime-trending'],
    queryFn: () => animeAPI.getTrending().then(r => r.data),
  })
  const { data: genres } = useQuery({
    queryKey: ['anime-genres'],
    queryFn: () => animeAPI.getGenres().then(r => r.data),
  })
  // Reload on genre change
  useEffect(() => {
    setLoadingAll(true)
    setAllSeries([])
    setHasMore(false)
    setPage(1)
    const params = { page: 1, page_size: 24 }
    if (genre) params.genre = genre
    animeAPI.getSeries(params).then(r => {
      setAllSeries(r.data.results || [])
      setHasMore(!!r.data.next)
      setPage(1)
    }).finally(() => setLoadingAll(false))
  }, [genre])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loadingAll) return
    const nextPage = page + 1
    setLoadingMore(true)
    const params = { page: nextPage, page_size: 24 }
    if (genre) params.genre = genre
    try {
      const res = await animeAPI.getSeries(params)
      setAllSeries(prev => {
        const ids = new Set(prev.map(s => s.id))
        return [...prev, ...(res.data.results || []).filter(s => !ids.has(s.id))]
      })
      setHasMore(!!res.data.next)
      setPage(nextPage)
    } catch (e) {
      if (e?.response?.status === 404) setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, loadingAll, genre, page])

  const loaderRef = useCallback(node => {
    if (!node) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { rootMargin: '200px' })
    obs.observe(node)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <div className="pb-20 animate-fade-in">
      {/* Hero */}
      <HeroBanner series={featured?.[0]} />

      {/* Featured row */}
      {featured?.length > 1 && (
        <RowSection title={t('anime.featured')} series={featured.slice(1)} loading={false} />
      )}

      {/* Trending */}
      <RowSection title={t('anime.trending')} series={trending} loading={loadingTrending} />

      {/* All anime with genre filter */}
      <section className="px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-xl font-bold">All Anime</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setGenre('')} className={`genre-pill ${!genre ? 'active' : ''}`}>All</button>
            {genres?.map(g => (
              <button key={g.id} onClick={() => setGenre(g.slug)} className={`genre-pill ${genre === g.slug ? 'active' : ''}`}>{g.name}</button>
            ))}
          </div>
        </div>

        {loadingAll ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-video rounded-lg" />
                <div className="skeleton h-3 rounded mt-2 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allSeries.map(s => (
              <SeriesCard key={s.id} series={s} type="anime" size="lg" showStats />
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex justify-center py-8">
          {loadingMore && <Spinner size={28} />}
        </div>
      </section>
    </div>
  )
}

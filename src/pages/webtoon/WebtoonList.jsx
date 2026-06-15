import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { webtoonAPI } from '@/utils/api'
import SeriesCard from '@/components/common/SeriesCard'
import { CardSkeleton, Spinner } from '@/components/common/LoadingScreen'

const ORDERINGS = [
  { value: '-views',      label: 'Trending' },
  { value: '-likes_count',label: 'Most Popular' },
  { value: '-created_at', label: 'Newest' },
  { value: '-updated_at', label: 'Recently Updated' },
]

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'ongoing',   label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus',    label: 'Hiatus' },
]

export default function WebtoonList() {
  const { t } = useTranslation()
  const [ordering, setOrdering] = useState('-views')
  const [status,   setStatus]   = useState('')
  const [genre,    setGenre]    = useState('')
  const [genres,   setGenres]   = useState([])

  const [series,      setSeries]      = useState([])
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)

  // Track current filter signature so stale responses are ignored
  const filterSig = useRef('')

  // Load genres once
  useEffect(() => {
    webtoonAPI.getGenres().then(r => setGenres(r.data)).catch(() => {})
  }, [])

  // Reload from page 1 whenever filters change
  useEffect(() => {
    const sig = `${ordering}|${status}|${genre}`
    filterSig.current = sig
    setLoading(true)
    setError(null)
    setSeries([])
    setPage(1)
    setHasMore(false)

    // Build params — skip empty strings so Django doesn't filter on ''
    const params = { page: 1, page_size: 24, ordering }
    if (status) params.status = status
    if (genre)  params.genre  = genre

    webtoonAPI.getSeries(params)
      .then(r => {
        if (filterSig.current !== sig) return   // stale, discard
        setSeries(r.data.results || [])
        setHasMore(!!r.data.next)
        setPage(1)
      })
      .catch(err => {
        if (filterSig.current !== sig) return
        setError(err?.response?.data?.detail || 'Failed to load series')
      })
      .finally(() => {
        if (filterSig.current === sig) setLoading(false)
      })
  }, [ordering, status, genre])

  // Load next page
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return
    const sig = filterSig.current
    const nextPage = page + 1
    setLoadingMore(true)

    const params = { page: nextPage, page_size: 24, ordering }
    if (status) params.status = status
    if (genre)  params.genre  = genre

    try {
      const res = await webtoonAPI.getSeries(params)
      if (filterSig.current !== sig) return   // filter changed while fetching
      setSeries(prev => {
        // De-duplicate by id
        const ids = new Set(prev.map(s => s.id))
        const fresh = (res.data.results || []).filter(s => !ids.has(s.id))
        return [...prev, ...fresh]
      })
      setHasMore(!!res.data.next)
      setPage(nextPage)
    } catch (err) {
      // 404 = no more pages → stop
      if (err?.response?.status === 404) setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, loading, ordering, status, genre, page])

  // IntersectionObserver for infinite scroll
  const loaderRef = useCallback(
    node => {
      if (!node) return
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) loadMore()
      }, { rootMargin: '200px' })
      observer.observe(node)
      return () => observer.disconnect()
    },
    [loadMore]
  )

  // Filter change helpers — reset to page 1
  const handleOrdering = v => { setOrdering(v) }
  const handleStatus   = v => { setStatus(v) }
  const handleGenre    = v => { setGenre(v) }

  return (
    <div className="px-4 lg:px-6 py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('nav.webtoons')}</h1>
        <span className="text-sm text-[var(--color-muted)]">
          {!loading && `${series.length} series`}
        </span>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={ordering} onChange={e => handleOrdering(e.target.value)} className="input-field w-auto text-sm">
          {ORDERINGS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={status} onChange={e => handleStatus(e.target.value)} className="input-field w-auto text-sm">
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => handleGenre('')} className={`genre-pill ${!genre ? 'active' : ''}`}>All</button>
          {genres.map(g => (
            <button key={g.id} onClick={() => handleGenre(g.slug)}
              className={`genre-pill ${genre === g.slug ? 'active' : ''}`}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[3/4] rounded-lg" />
              <div className="skeleton h-3 rounded mt-2 w-3/4" />
              <div className="skeleton h-2 rounded mt-1 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={() => handleOrdering(ordering)} className="btn-secondary">Retry</button>
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-muted)]">No series found for this filter.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {series.map(s => (
              <SeriesCard key={s.id} series={s} type="webtoon" size="md" showStats />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} className="flex justify-center py-8">
            {loadingMore && <Spinner size={28} />}
            {!hasMore && series.length > 0 && !loadingMore && (
              <p className="text-[var(--color-muted)] text-sm">— All series loaded —</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

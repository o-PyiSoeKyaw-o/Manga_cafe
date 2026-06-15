import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ArrowLeft, Heart, Bookmark, List, X, Loader2 } from 'lucide-react'
import { webtoonAPI } from '@/utils/api'
import { useScrollProgress } from '@/hooks/useDebounce'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

export default function WebtoonReader() {
  const { slug, episode } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [uiVisible, setUiVisible] = useState(true)
  const [showChapters, setShowChapters] = useState(false)
  const hideTimer = useRef()
  const scrollProgress = useScrollProgress()

  const { data: episodeData, isLoading, error } = useQuery({
    queryKey: ['episode', slug, episode],
    queryFn: () => webtoonAPI.getEpisode(slug, episode).then(r => r.data),
  })

  const { data: seriesData } = useQuery({
    queryKey: ['series-lite', slug],
    queryFn: () => webtoonAPI.getSeriesDetail(slug).then(r => r.data),
  })

  const progressMutation = useMutation({
    mutationFn: (progress) => webtoonAPI.updateProgress(slug, { progress, episode_id: episodeData?.id }),
  })

  // Save progress periodically
  useEffect(() => {
    if (!isAuthenticated || !episodeData) return
    const timer = setInterval(() => {
      progressMutation.mutate(scrollProgress)
    }, 10000)
    return () => clearInterval(timer)
  }, [scrollProgress, isAuthenticated, episodeData])

  // Auto-hide UI on scroll
  const resetHideTimer = useCallback(() => {
    setUiVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setUiVisible(false), 3000)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', resetHideTimer, { passive: true })
    window.addEventListener('mousemove', resetHideTimer)
    return () => {
      window.removeEventListener('scroll', resetHideTimer)
      window.removeEventListener('mousemove', resetHideTimer)
      clearTimeout(hideTimer.current)
    }
  }, [resetHideTimer])

  const episodeNum = parseInt(episode)
  const prevEp = episodeNum > 1 ? episodeNum - 1 : null
  const episodes = seriesData?.episodes || []
  const nextEp = episodes.find(e => e.episode_number === episodeNum + 1)

  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Loader2 size={40} className="text-primary-400 animate-spin" />
    </div>
  )

  if (error?.response?.status === 402) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-sm">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2">Episode Locked</h2>
        <p className="text-[var(--color-muted)] text-sm mb-4">
          Unlock this episode for {error.response.data.coin_cost} coins
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
          <button
            onClick={() => webtoonAPI.unlockEpisode(error.response.data.episode_id).then(() => window.location.reload())}
            className="btn-primary"
          >
            Unlock Now
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#111] relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-[var(--color-border)] z-50">
        <div className="progress-bar h-full" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Top UI */}
      <div className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent px-4 pt-1 pb-6 transition-all duration-300 ${uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-2xl mx-auto flex items-center gap-4 h-14">
          <button onClick={() => navigate(`/webtoons/${slug}`)} className="text-white hover:text-white/70 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate text-sm">{seriesData?.title}</p>
            <p className="text-white/50 text-xs">Episode {episode}</p>
          </div>
          <button onClick={() => setShowChapters(true)} className="text-white hover:text-white/70">
            <List size={22} />
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="webtoon-reader pt-14">
        {episodeData?.pages?.map((page) => (
          <img
            key={page.id}
            src={page.image}
            alt={`Page ${page.page_number}`}
            loading="lazy"
            className="w-full block select-none"
          />
        ))}
      </div>

      {/* Bottom UI - next/prev */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 transition-all duration-300 ${uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {prevEp ? (
            <Link to={`/read/${slug}/${prevEp}`} className="btn-secondary flex items-center gap-2 flex-1 justify-center">
              <ChevronLeft size={18} />Prev
            </Link>
          ) : <div className="flex-1" />}

          <span className="text-white/50 text-xs shrink-0">{Math.round(scrollProgress)}%</span>

          {nextEp ? (
            <Link to={`/read/${slug}/${nextEp.episode_number}`}
              className={`flex items-center gap-2 flex-1 justify-center ${nextEp.is_unlocked ? 'btn-primary' : 'btn-secondary opacity-60'}`}>
              Next <ChevronRight size={18} />
            </Link>
          ) : (
            <Link to={`/webtoons/${slug}`} className="btn-secondary flex-1 text-center">Back to Series</Link>
          )}
        </div>
      </div>

      {/* Chapter list drawer */}
      {showChapters && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowChapters(false)}>
          <div className="w-80 bg-[var(--color-card)] h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold">Episodes</h3>
              <button onClick={() => setShowChapters(false)}><X size={20} /></button>
            </div>
            {episodes.map(ep => (
              <Link key={ep.id} to={`/read/${slug}/${ep.episode_number}`}
                onClick={() => setShowChapters(false)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-border)] transition-colors ${ep.episode_number === episodeNum ? 'bg-primary-500/10 text-primary-400' : ''}`}>
                <span className="text-sm font-medium">Episode {ep.episode_number}</span>
                {!ep.is_unlocked && <span className="text-[var(--color-muted)] ml-auto">🔒</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

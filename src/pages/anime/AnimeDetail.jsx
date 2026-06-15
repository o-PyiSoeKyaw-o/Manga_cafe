import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, Heart, Eye, Lock, Clock, Zap } from 'lucide-react'
import { animeAPI } from '@/utils/api'
import { useAuthStore } from '@/store'
import { Spinner, EmptyState } from '@/components/common/LoadingScreen'
import toast from 'react-hot-toast'

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toString() || '0'
}

export default function AnimeDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: series, isLoading } = useQuery({
    queryKey: ['anime-series', slug],
    queryFn: () => animeAPI.getSeriesDetail(slug).then(r => r.data),
  })

  const likeMutation = useMutation({
    mutationFn: () => animeAPI.likeSeries(slug),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['anime-series', slug])
      toast.success(res.data.liked ? 'Liked!' : 'Unliked')
    },
  })

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size={32} /></div>
  if (!series) return <EmptyState title="Series not found" />

  const firstFreeEp = series.episodes?.find(e => e.is_free)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden">
        <img src={series.banner || series.thumbnail} alt={series.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-black/30 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 -mt-24 relative z-10 pb-20">
        <div className="flex gap-5 mb-6">
          <img src={series.thumbnail} alt={series.title} className="w-32 sm:w-44 shrink-0 rounded-xl shadow-2xl object-cover aspect-[3/4]" />
          <div className="pt-20 min-w-0">
            <div className="flex flex-wrap gap-1 mb-2">
              {series.genres?.map(g => <span key={g.id} className="tag bg-orange-500/20 text-orange-400">{g.name}</span>)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">{series.title}</h1>
            <p className="text-white/60 text-sm">{series.year} · {series.status}</p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex gap-4 text-sm text-[var(--color-muted)] mb-4">
          <span className="flex items-center gap-1"><Eye size={14} />{formatCount(series.views)}</span>
          <span className="flex items-center gap-1"><Heart size={14} />{formatCount(series.likes_count)}</span>
          <span>{series.total_episodes} episodes</span>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {firstFreeEp && (
            <Link to={`/watch/${slug}/1`} className="btn-primary flex items-center gap-2">
              <Play size={16} fill="white" /> {t('anime.watch')}
            </Link>
          )}
          <button onClick={() => isAuthenticated ? likeMutation.mutate() : navigate('/login')}
            className={`btn-secondary flex items-center gap-2 ${series.is_liked ? 'text-red-400' : ''}`}>
            <Heart size={16} className={series.is_liked ? 'fill-red-400' : ''} />
            {series.is_liked ? 'Liked' : 'Like'}
          </button>
        </div>

        {/* Description */}
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">{series.description}</p>
        </div>

        {/* Episodes grid - Netflix style */}
        <h3 className="font-semibold mb-4">Episodes</h3>
        <div className="grid gap-3">
          {series.episodes?.map((ep) => (
            <div key={ep.id} className="card flex gap-4 p-3 hover:bg-[var(--color-border)] transition-colors">
              <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-[var(--color-border)]">
                {ep.thumbnail
                  ? <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">{ep.episode_number}</div>
                }
                {ep.is_unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                    <Play size={24} className="text-white" fill="white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{ep.episode_number}. {ep.title}</p>
                    <p className="text-xs text-[var(--color-muted)] flex items-center gap-1 mt-1">
                      <Clock size={10} />{ep.duration_display || `${ep.duration_seconds}s`}
                    </p>
                    {ep.description && <p className="text-xs text-[var(--color-muted)] line-clamp-2 mt-1">{ep.description}</p>}
                  </div>
                  {ep.is_unlocked ? (
                    <Link to={`/watch/${slug}/${ep.episode_number}`} className="btn-primary shrink-0 text-xs px-3 py-1.5 flex items-center gap-1">
                      <Play size={12} fill="white" />Play
                    </Link>
                  ) : (
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Lock size={16} className="text-[var(--color-muted)]" />
                      <span className="coin-badge text-[10px]"><Zap size={10} />{ep.coin_cost}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

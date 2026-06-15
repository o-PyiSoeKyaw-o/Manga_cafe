import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Eye, Bookmark, Share2, Calendar, BookOpen, Star, ChevronRight, Lock, Zap } from 'lucide-react'
import { webtoonAPI, reviewAPI, bookmarkAPI } from '@/utils/api'
import { useAuthStore } from '@/store'
import { Spinner, StarRating, EmptyState } from '@/components/common/LoadingScreen'
import SeriesCard from '@/components/common/SeriesCard'
import toast from 'react-hot-toast'

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toString() || '0'
}

function ReviewForm({ seriesId, onSuccess }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const mutation = useMutation({
    mutationFn: () => reviewAPI.create({ series_id: seriesId, series_type: 'webtoon', rating, content }),
    onSuccess: () => { toast.success('Review submitted!'); onSuccess?.() },
    onError: () => toast.error('Failed to submit review'),
  })

  return (
    <div className="card p-4 mt-4">
      <h4 className="font-semibold mb-3">{t('reviews.write')}</h4>
      <StarRating rating={rating} onChange={setRating} size={24} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        rows={4}
        className="input-field mt-3 resize-none"
      />
      <button
        onClick={() => mutation.mutate()}
        disabled={!rating || !content.trim() || mutation.isPending}
        className="btn-primary mt-3 disabled:opacity-50"
      >
        {mutation.isPending ? <Spinner size={16} /> : t('reviews.submit')}
      </button>
    </div>
  )
}

export default function WebtoonDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', slug],
    queryFn: () => webtoonAPI.getSeriesDetail(slug).then(r => r.data),
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'webtoon', series?.id],
    queryFn: () => reviewAPI.getReviews('webtoon', series.id).then(r => r.data),
    enabled: !!series?.id,
  })

  const { data: related } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => webtoonAPI.getSeries({ genre: series?.genres?.[0]?.slug, page_size: 6 }).then(r => r.data.results?.filter(s => s.slug !== slug).slice(0, 5)),
    enabled: !!series?.genres?.[0]?.slug,
  })

  const likeMutation = useMutation({
    mutationFn: () => webtoonAPI.likeSeries(slug),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['series', slug])
      toast.success(res.data.liked ? 'Liked!' : 'Unliked')
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkAPI.toggle(series.id, 'webtoon'),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['series', slug])
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed bookmark')
    },
  })

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Spinner size={32} />
    </div>
  )

  if (!series) return <EmptyState title="Series not found" icon={BookOpen} />

  const firstFreeEpisode = series.episodes?.find(e => e.is_free)
  const avgRating = reviews?.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={series.banner_image || series.cover_image}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="hero-banner absolute inset-0" />
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 -mt-20 relative z-10 pb-20">
        <div className="flex gap-5 mb-6">
          {/* Cover */}
          <img src={series.cover_image} alt={series.title}
            className="w-28 sm:w-36 shrink-0 rounded-xl shadow-xl object-cover aspect-[3/4]" />

          {/* Info */}
          <div className="pt-16 sm:pt-20 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              {series.genres?.map(g => (
                <span key={g.id} className="tag bg-primary-500/20 text-primary-400">{g.name}</span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">{series.title}</h1>
            <p className="text-white/60 text-sm">
              by <Link to={`/profile/${series.author?.username}`} className="text-white/80 hover:text-white font-medium">{series.author?.username}</Link>
              {' · '}{t(`series.status.${series.status}`)}
              {series.schedule !== 'irregular' && ` · ${t('series.schedule')} ${series.schedule.toUpperCase()}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Stats */}
            <div className="flex gap-4 text-sm text-[var(--color-muted)] mb-4">
              <span className="flex items-center gap-1"><Eye size={14} />{formatCount(series.views)}</span>
              <span className="flex items-center gap-1"><Heart size={14} />{formatCount(series.likes_count)}</span>
              {avgRating && <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" />{avgRating}</span>}
              <span className="flex items-center gap-1"><BookOpen size={14} />{series.total_episodes} eps</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {firstFreeEpisode && (
                <Link to={`/read/${slug}/${firstFreeEpisode.episode_number}`} className="btn-primary flex items-center gap-2">
                  <BookOpen size={16} /> {t('series.read')}
                </Link>
              )}
              <button onClick={() => isAuthenticated ? likeMutation.mutate() : navigate('/login')}
                className={`btn-secondary flex items-center gap-2 ${series.is_liked ? 'text-red-400 border-red-400/30' : ''}`}>
                <Heart size={16} className={series.is_liked ? 'fill-red-400' : ''} />
                {series.is_liked ? t('episode.liked') : t('episode.like')}
              </button>
              <button onClick={() => isAuthenticated ? bookmarkMutation.mutate() : navigate('/login')}
                className={`btn-secondary flex items-center gap-2 ${series.is_bookmarked ? 'text-primary-400' : ''}`}>
                <Bookmark size={16} className={series.is_bookmarked ? 'fill-primary-400' : ''} />
                {series.is_bookmarked ? t('series.subscribed') : t('series.subscribe')}
              </button>
            </div>

            {/* Description */}
            <div className="card p-4 mb-6">
              <h3 className="font-semibold mb-2">{t('series.description')}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{series.description}</p>
            </div>

            {/* Reviews */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t('series.reviews')} {reviews?.length ? `(${reviews.length})` : ''}</h3>
                {isAuthenticated && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm text-primary-400 hover:text-primary-300">
                    {t('reviews.write')}
                  </button>
                )}
              </div>
              {showReviewForm && <ReviewForm seriesId={series.id} onSuccess={() => { setShowReviewForm(false); queryClient.invalidateQueries(['reviews']) }} />}
              {reviews?.length ? reviews.slice(0, 5).map(r => (
                <div key={r.id} className="card p-4 mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">{r.user.username[0].toUpperCase()}</div>
                    <div>
                      <p className="font-medium text-sm">{r.user.username}</p>
                      <StarRating rating={r.rating} readonly size={12} />
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">{r.content}</p>
                </div>
              )) : (
                <p className="text-[var(--color-muted)] text-sm">{t('reviews.no_reviews')}</p>
              )}
            </div>

            {/* Related */}
            {related?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t('series.you_may_like')}</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {related.map(s => (
                    <div key={s.id} className="shrink-0"><SeriesCard series={s} type="webtoon" size="sm" /></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Episode list sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="card sticky top-20">
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="font-semibold">{t('series.episodes')} ({series.total_episodes})</h3>
              </div>
              <ul className="max-h-[600px] overflow-y-auto divide-y divide-[var(--color-border)]">
                {series.episodes?.map((ep) => (
                  <li key={ep.id}>
                    {ep.is_unlocked ? (
                      <Link to={`/read/${slug}/${ep.episode_number}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-border)] transition-colors">
                        {ep.thumbnail
                          ? <img src={ep.thumbnail} className="w-12 h-14 rounded object-cover shrink-0" alt="" />
                          : <div className="w-12 h-14 rounded bg-[var(--color-border)] shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ep.title}</p>
                          <p className="text-xs text-[var(--color-muted)]">#{ep.episode_number} · {new Date(ep.published_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--color-muted)] text-xs shrink-0">
                          <Heart size={10} />{ep.likes_count}
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 opacity-60">
                        <div className="w-12 h-14 rounded bg-[var(--color-border)] shrink-0 flex items-center justify-center">
                          <Lock size={14} className="text-[var(--color-muted)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ep.title}</p>
                          <span className="coin-badge text-[10px]"><Zap size={10} />{ep.coin_cost} coins</span>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

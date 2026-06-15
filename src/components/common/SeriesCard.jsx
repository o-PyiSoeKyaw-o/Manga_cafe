import { Link } from 'react-router-dom'
import { Heart, Eye, Lock, Zap } from 'lucide-react'
import clsx from 'clsx'

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toString() || '0'
}

export default function SeriesCard({ series, type = 'webtoon', size = 'md', showStats = true, badge = null }) {
  const path = type === 'webtoon' ? `/webtoons/${series.slug}` : `/anime/${series.slug}`
  const cover = type === 'webtoon' ? series.cover_image : series.thumbnail

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48',
    xl: 'w-56',
  }

  return (
    <Link to={path} className={clsx('series-card block group', sizeClasses[size])}>
      {/* Cover */}
      <div className={clsx('relative overflow-hidden rounded-lg', type === 'webtoon' ? 'aspect-[3/4]' : 'aspect-video')}>
        {cover ? (
          <img src={cover} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[var(--color-border)] flex items-center justify-center">
            <span className="text-[var(--color-muted)] text-xs text-center px-2">{series.title}</span>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badge && (
            <span className="tag bg-primary-500 text-white text-[10px] font-bold">{badge}</span>
          )}
          {series.is_premium && (
            <span className="coin-badge text-[10px]"><Zap size={10} />Premium</span>
          )}
        </div>

        {/* Status */}
        {series.status === 'ongoing' && (
          <div className="absolute top-2 right-2">
            <span className="w-2 h-2 bg-green-400 rounded-full block animate-pulse" />
          </div>
        )}

        {/* Stats overlay on hover */}
        {showStats && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 text-white text-[10px]">
              <Eye size={10} />{formatCount(series.views)}
            </span>
            <span className="flex items-center gap-1 text-white text-[10px]">
              <Heart size={10} />{formatCount(series.likes_count)}
            </span>
          </div>
        )}
      </div>

      {/* Title & meta */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-[var(--color-text)] line-clamp-2 leading-tight">{series.title}</p>
        {series.genres?.length > 0 && (
          <p className="text-[10px] text-[var(--color-muted)] mt-0.5 truncate">
            {series.genres.slice(0, 2).map((g) => g.name).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}

import { Star } from 'lucide-react'

// Loading screen
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
          <span className="text-white font-black text-lg">MC</span>
        </div>
        <p className="text-[var(--color-muted)] text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ count = 6, type = 'webtoon' }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-40">
          <div className={`skeleton rounded-lg ${type === 'webtoon' ? 'aspect-[3/4]' : 'aspect-video'}`} />
          <div className="skeleton h-3 rounded mt-2 w-3/4" />
          <div className="skeleton h-2 rounded mt-1 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// Inline loading spinner
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg className={`animate-spin text-primary-400 ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// Star rating
export function StarRating({ rating = 0, onChange, readonly = false, size = 20 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border)]'}
          />
        </button>
      ))}
    </div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-[var(--color-border)] mb-4" />}
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--color-muted)] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

// Offline banner
export function OfflineBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      You're offline — showing cached content
    </div>
  )
}

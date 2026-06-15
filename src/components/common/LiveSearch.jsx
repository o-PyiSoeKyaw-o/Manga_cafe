import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, BookOpen, Tv, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

export default function LiveSearch({ onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const wsRef = useRef(null)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  // Connect WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/search/`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setResults(data.results || [])
      setLoading(false)
    }

    wsRef.current.onerror = () => {
      // Fallback to REST API if WS fails
      setLoading(false)
    }

    return () => wsRef.current?.close()
  }, [])

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Search on debounced query
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ query: debouncedQuery, type: 'all' }))
    } else {
      // HTTP fallback
      import('@/utils/api').then(({ webtoonAPI, animeAPI }) => {
        Promise.all([
          webtoonAPI.search(debouncedQuery),
          animeAPI.search(debouncedQuery),
        ]).then(([wt, an]) => {
          const combined = [
            ...(wt.data.results || []).map((s) => ({ ...s, type: 'webtoon' })),
            ...(an.data.results || []).map((s) => ({ ...s, type: 'anime' })),
          ]
          setResults(combined)
          setLoading(false)
        })
      })
    }
  }, [debouncedQuery])

  const handleSelect = (item) => {
    if (item.type === 'webtoon') navigate(`/webtoons/${item.slug}`)
    else navigate(`/anime/${item.slug}`)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl card shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
          {loading ? <Loader2 size={20} className="text-primary-400 animate-spin shrink-0" /> : <Search size={20} className="text-[var(--color-muted)] shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('nav.search')}
            className="flex-1 bg-transparent outline-none text-[var(--color-text)] placeholder-[var(--color-muted)] text-lg"
          />
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto py-2">
            {results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-border)] transition-colors text-left"
                >
                  {item.cover
                    ? <img src={item.cover} className="w-10 h-12 object-cover rounded" alt={item.title} />
                    : <div className="w-10 h-12 bg-[var(--color-border)] rounded flex items-center justify-center">
                        {item.type === 'webtoon' ? <BookOpen size={16} /> : <Tv size={16} />}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-muted)] capitalize">{item.type} · {item.status}</p>
                  </div>
                  {item.type === 'webtoon'
                    ? <span className="tag bg-indigo-500/20 text-indigo-400 shrink-0">Webtoon</span>
                    : <span className="tag bg-orange-500/20 text-orange-400 shrink-0">Anime</span>
                  }
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="px-4 py-8 text-center text-[var(--color-muted)] text-sm">
            No results for "<span className="text-[var(--color-text)]">{query}</span>"
          </div>
        )}
      </div>
    </div>
  )
}

// Search page
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon } from 'lucide-react'
import { webtoonAPI, animeAPI } from '@/utils/api'
import SeriesCard from '@/components/common/SeriesCard'
import { Spinner, EmptyState } from '@/components/common/LoadingScreen'
import { useDebounce } from '@/hooks/useDebounce'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [tab, setTab] = useState('all')
  const debouncedQ = useDebounce(query, 400)

  const { data: webtoons, isLoading: wLoading } = useQuery({
    queryKey: ['search-webtoons', debouncedQ],
    queryFn: () => webtoonAPI.search(debouncedQ).then(r => r.data.results),
    enabled: debouncedQ.length >= 2,
  })

  const { data: anime, isLoading: aLoading } = useQuery({
    queryKey: ['search-anime', debouncedQ],
    queryFn: () => animeAPI.search(debouncedQ).then(r => r.data.results),
    enabled: debouncedQ.length >= 2,
  })

  useEffect(() => { if (debouncedQ) setSearchParams({ q: debouncedQ }) }, [debouncedQ])

  const loading = wLoading || aLoading
  const results = tab === 'webtoon' ? webtoons : tab === 'anime' ? anime : [...(webtoons || []), ...(anime || [])]

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 pb-20 animate-fade-in">
      <div className="relative mb-6">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search webtoons, anime, authors..."
          className="input-field pl-11 text-lg py-4"
          autoFocus
        />
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--color-border)]">
        {['all', 'webtoon', 'anime'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              tab === t ? 'border-primary-500 text-primary-400' : 'border-transparent text-[var(--color-muted)]'
            }`}>
            {t === 'all' ? 'All' : t === 'webtoon' ? 'Webtoons' : 'Anime'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> :
        !debouncedQ ? <EmptyState icon={SearchIcon} title="Search for anything" description="Find webtoons, anime, and creators" /> :
        results?.length === 0 ? <EmptyState icon={SearchIcon} title="No results" description={`No results for "${debouncedQ}"`} /> :
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results?.map((s, i) => (
            <SeriesCard key={`${s.type || 'item'}-${s.id}-${i}`}
              series={s} type={tab === 'all' ? (webtoons?.includes(s) ? 'webtoon' : 'anime') : tab} size="md" />
          ))}
        </div>
      }
    </div>
  )
}

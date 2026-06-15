// Bookmarks page
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookOpen, Tv, Trash2 } from 'lucide-react'
import { bookmarkAPI } from '@/utils/api'
import SeriesCard from '@/components/common/SeriesCard'
import { Spinner, EmptyState } from '@/components/common/LoadingScreen'
import toast from 'react-hot-toast'

export default function Bookmarks() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', tab],
    queryFn: () => bookmarkAPI.getAll(tab === 'all' ? null : tab).then(r => r.data),
  })

  const removeMutation = useMutation({
    mutationFn: ({ id, type }) => bookmarkAPI.toggle(id, type),
    onSuccess: () => { queryClient.invalidateQueries(['bookmarks']); toast.success('Removed') },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bookmark className="text-primary-400" size={22} />{t('nav.bookmarks')}
      </h1>

      <div className="flex gap-1 mb-6 border-b border-[var(--color-border)]">
        {[
          { key: 'all', label: 'All', icon: Bookmark },
          { key: 'webtoon', label: t('nav.webtoons'), icon: BookOpen },
          { key: 'anime', label: t('nav.anime'), icon: Tv },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-primary-500 text-primary-400' : 'border-transparent text-[var(--color-muted)]'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner size={32} /></div> :
        data?.length === 0 ? <EmptyState icon={Bookmark} title="No bookmarks yet" description="Start bookmarking your favourite series!" /> :
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.map(b => (
            <div key={b.bookmark_id} className="relative group">
              <SeriesCard series={b.series} type={b.series_type} size="md" />
              <button
                onClick={() => removeMutation.mutate({ id: b.series.id, type: b.series_type })}
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

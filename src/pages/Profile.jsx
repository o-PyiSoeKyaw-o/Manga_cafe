// Profile page
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store'
import { authAPI, webtoonAPI } from '@/utils/api'
import { Users, BookOpen } from 'lucide-react'
import { Spinner } from '@/components/common/LoadingScreen'
import SeriesCard from '@/components/common/SeriesCard'
import toast from 'react-hot-toast'

export default function Profile() {
  const { username } = useParams()
  const { user: me } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => authAPI.getUser(username).then(r => r.data),
  })

  const { data: series } = useQuery({
    queryKey: ['user-series', username],
    queryFn: () => webtoonAPI.getSeries({ author: username }).then(r => r.data.results),
    enabled: !!username,
  })

  const followMutation = useMutation({
    mutationFn: () => authAPI.follow(username),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['profile', username])
      toast.success(res.data.is_following ? 'Followed!' : 'Unfollowed')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>
  if (!profile) return <div className="text-center py-20 text-[var(--color-muted)]">User not found</div>

  const isMe = me?.username === username

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 pb-20 animate-fade-in">
      <div className="card p-6 mb-8 flex flex-col sm:flex-row gap-5 items-start">
        {profile.avatar
          ? <img src={profile.avatar} className="w-20 h-20 rounded-full object-cover shrink-0" alt={profile.username} />
          : <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">{profile.username[0].toUpperCase()}</div>
        }
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{profile.username}</h1>
          {profile.bio && <p className="text-[var(--color-muted)] text-sm mb-3">{profile.bio}</p>}
          <div className="flex gap-6 text-sm text-[var(--color-muted)] mb-4">
            <span><strong className="text-[var(--color-text)]">{profile.followers_count}</strong> followers</span>
            <span><strong className="text-[var(--color-text)]">{profile.following_count}</strong> following</span>
          </div>
          {!isMe && (
            <button onClick={() => followMutation.mutate()}
              className={profile.is_followed ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}>
              <Users size={16} />
              {profile.is_followed ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {series?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={18} />Series by {profile.username}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {series.map(s => <SeriesCard key={s.id} series={s} type="webtoon" size="md" />)}
          </div>
        </div>
      )}
    </div>
  )
}

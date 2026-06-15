import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, SkipBack,
  Settings, ChevronRight,
} from 'lucide-react'
import { animeAPI } from '@/utils/api'
import { useAuthStore } from '@/store'
import { Spinner } from '@/components/common/LoadingScreen'

// Build the streaming URL from episode id so Range requests work
function streamUrl(episodeId) {
  const base = import.meta.env.VITE_API_URL || '/api'
  return `${base}/anime/episodes/${episodeId}/stream/`
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${sec}`
}

export default function VideoPlayer() {
  const { slug, episode } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const videoRef     = useRef()
  const containerRef = useRef()
  const progressRef  = useRef()
  const hideTimer    = useRef()

  const [playing,      setPlaying]      = useState(false)
  const [muted,        setMuted]        = useState(false)
  const [volume,       setVolume]       = useState(1)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [buffered,     setBuffered]     = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error,        setError]        = useState(null)
  const [waiting,      setWaiting]      = useState(false)

  // ── Fetch episode meta ───────────────────────────────────────
  const { data: ep, isLoading, error: fetchError } = useQuery({
    queryKey: ['anime-episode', slug, episode],
    queryFn: () => animeAPI.getEpisode(slug, parseInt(episode)).then(r => r.data),
  })

  const { data: series } = useQuery({
    queryKey: ['anime-series-lite', slug],
    queryFn: () => animeAPI.getSeriesDetail(slug).then(r => r.data),
  })

  const progressMutation = useMutation({
    mutationFn: (pos) =>
      animeAPI.updateWatchPosition(slug, {
        episode_id: ep?.id,
        position: Math.floor(pos),
      }),
  })

  // Save position every 15 s
  useEffect(() => {
    if (!ep || !isAuthenticated) return
    const id = setInterval(() => {
      if (videoRef.current)
        progressMutation.mutate(videoRef.current.currentTime)
    }, 15_000)
    return () => clearInterval(id)
  }, [ep, isAuthenticated])

  // ── Auto-hide controls ───────────────────────────────────────
  const resetHide = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }, [playing])

  useEffect(() => {
    window.addEventListener('mousemove', resetHide)
    window.addEventListener('touchstart', resetHide)
    return () => {
      window.removeEventListener('mousemove', resetHide)
      window.removeEventListener('touchstart', resetHide)
      clearTimeout(hideTimer.current)
    }
  }, [resetHide])

  // ── Fullscreen listener ──────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current
      if (!v) return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          v.paused ? v.play() : v.pause()
          break
        case 'ArrowRight':
          v.currentTime = Math.min(v.currentTime + 10, v.duration)
          break
        case 'ArrowLeft':
          v.currentTime = Math.max(v.currentTime - 10, 0)
          break
        case 'ArrowUp':
          v.volume = Math.min(v.volume + 0.1, 1)
          setVolume(v.volume)
          break
        case 'ArrowDown':
          v.volume = Math.max(v.volume - 0.1, 0)
          setVolume(v.volume)
          break
        case 'm':
          v.muted = !v.muted
          setMuted(v.muted)
          break
        case 'f':
          handleFullscreen()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Controls ─────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleSeek = (e) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
    setCurrentTime(v.currentTime)
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    setMuted(val === 0)
    if (videoRef.current) videoRef.current.muted = val === 0
  }

  const skip = (sec) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.currentTime + sec, duration))
  }

  // ── Buffered progress ────────────────────────────────────────
  const updateBuffered = () => {
    const v = videoRef.current
    if (!v || !v.buffered.length) return
    setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
  }

  const playPercent = duration ? (currentTime / duration) * 100 : 0

  // ── State indicators ─────────────────────────────────────────
  const nextEp = series?.episodes?.find(
    e => e.episode_number === parseInt(episode) + 1
  )

  // ── Locked / loading states ──────────────────────────────────
  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Spinner size={40} />
    </div>
  )

  if (fetchError?.response?.status === 402) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-sm">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2">Episode Locked</h2>
        <p className="text-[var(--color-muted)] text-sm mb-4">
          Cost: {fetchError.response.data.coin_cost} coins
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
          <button
            onClick={() =>
              animeAPI.unlockEpisode(fetchError.response.data.episode_id)
                .then(() => window.location.reload())
            }
            className="btn-primary"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  )

  const videoSrc = ep?.id ? streamUrl(ep.id) : null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex flex-col select-none"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className={`absolute top-0 left-0 right-0 z-20 px-4 py-3
        bg-gradient-to-b from-black/80 to-transparent
        flex items-center gap-4 transition-opacity duration-300
        ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button onClick={() => navigate(`/anime/${slug}`)} className="text-white hover:text-white/70">
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0">
          <p className="text-white font-semibold truncate text-sm">{series?.title}</p>
          <p className="text-white/50 text-xs">Ep {episode}: {ep?.title}</p>
        </div>
      </div>

      {/* ── Video element ───────────────────────────────────── */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="flex-1 w-full object-contain cursor-pointer"
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onTimeUpdate={() => {
          setCurrentTime(videoRef.current?.currentTime || 0)
          updateBuffered()
        }}
        onLoadedMetadata={() => {
          setDuration(videoRef.current?.duration || 0)
          setError(null)
        }}
        onError={() => setError('Failed to load video. Try refreshing.')}
        onVolumeChange={() => {
          setMuted(videoRef.current?.muted || false)
          setVolume(videoRef.current?.volume || 1)
        }}
        onEnded={() => {
          setPlaying(false)
          setShowControls(true)
        }}
      />

      {/* Buffering spinner */}
      {waiting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Spinner size={48} />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70 p-4">
          <div className="text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <button onClick={() => { setError(null); videoRef.current?.load() }} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom controls ──────────────────────────────────── */}
      <div className={`absolute bottom-0 left-0 right-0 z-20
        bg-gradient-to-t from-black/90 via-black/40 to-transparent
        px-4 pb-5 pt-16 transition-opacity duration-300
        ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* ── Progress bar ── */}
        <div
          ref={progressRef}
          className="relative w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group"
          onClick={handleSeek}
          onMouseMove={(e) => {
            // Show hover position — optional visual hint
          }}
        >
          {/* Buffered */}
          <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }} />
          {/* Played */}
          <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-none"
            style={{ width: `${playPercent}%` }} />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
              w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${playPercent}%` }}
          />
        </div>

        {/* ── Buttons row ── */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
            {playing
              ? <Pause size={26} className="fill-white" />
              : <Play  size={26} className="fill-white" />
            }
          </button>

          {/* Skip back/forward */}
          <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors" title="Rewind 10s (←)">
            <SkipBack size={20} />
          </button>
          <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors" title="Forward 10s (→)">
            <SkipForward size={20} />
          </button>

          {/* Volume */}
          <button onClick={() => {
            const v = videoRef.current
            if (!v) return
            v.muted = !v.muted
            setMuted(v.muted)
          }} className="text-white/70 hover:text-white transition-colors">
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-primary-500 cursor-pointer hidden sm:block"
          />

          {/* Time */}
          <span className="text-white/60 text-xs tabular-nums ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Next episode */}
          {nextEp?.is_unlocked && (
            <Link
              to={`/watch/${slug}/${nextEp.episode_number}`}
              className="text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              Next Ep <ChevronRight size={14} />
            </Link>
          )}

          {/* Fullscreen */}
          <button onClick={handleFullscreen} className="text-white/70 hover:text-white transition-colors" title="Fullscreen (f)">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

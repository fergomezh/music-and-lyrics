import { Heart, Music } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

export function TrackInfo() {
  const { currentTrack, isPlaying, isFavorite, toggleFavoriteWithLyrics, playError } = usePlayer()

  if (!currentTrack) {
    return (
      <div className="track-info">
        <div className="track-info__art track-info__art--placeholder" style={{ width: 200, height: 200 }}>
          <Music size={48} strokeWidth={1} />
        </div>
        <div className="track-info__meta">
          <div className="track-info__title" style={{ color: 'var(--text-dim)' }}>No Track Playing</div>
          <div className="track-info__artist">Search for a song to begin</div>
        </div>
      </div>
    )
  }

  const isFav = isFavorite(currentTrack.videoId)

  return (
    <div className="track-info">
      <div className="track-info__vinyl-container">
        <img
          className="track-info__art"
          src={currentTrack.thumbnailUrl}
          alt={currentTrack.title}
          onError={e => { e.currentTarget.style.display = 'none' }}
          style={isPlaying ? { animation: 'vinylSpin 8s linear infinite' } : {}}
        />
        {isPlaying && <div className="track-info__vinyl-glow" />}
      </div>
      <div className="track-info__meta">
        <div className="track-info__title">{currentTrack.title}</div>
        <div className="track-info__artist">{currentTrack.channelTitle}</div>
        {playError && <div className="track-info__error">{playError}</div>}
        <div className="track-info__actions">
          <button
            className={`btn-heart${isFav ? ' btn-heart--active' : ''}`}
            onClick={() => toggleFavoriteWithLyrics(currentTrack)}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}

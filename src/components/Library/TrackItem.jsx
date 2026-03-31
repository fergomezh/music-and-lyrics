import { Play, ListEnd, BookmarkPlus, Heart, Trash2 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

/**
 * Shared track row used by SearchResults, Favorites, and PlaylistDetail.
 *
 * Props:
 *   track                  — track object
 *   playlistId             — when set, renders in "playlist context"
 *   showRemoveFromPlaylist — show the "remove from playlist" button
 */
export function TrackItem({ track, playlistId, showRemoveFromPlaylist }) {
  const {
    currentTrack,
    playTrack,
    addToQueue,
    isFavorite,
    toggleFavoriteWithLyrics,
    openAddToPlaylist,
    removeTrackFromPlaylist,
  } = usePlayer()

  const isActive = currentTrack?.videoId === track.videoId
  const isFav    = isFavorite(track.videoId)

  return (
    <div
      className={`track-item${isActive ? ' track-item--active' : ''}`}
      onClick={() => playTrack(track)}
    >
      {/* Thumbnail + EQ overlay */}
      <div className="track-item__thumb-wrap">
        <img
          className="track-item__thumb"
          src={track.thumbnailUrl}
          alt=""
          loading="lazy"
          onError={e => { e.currentTarget.style.visibility = 'hidden' }}
        />
        {isActive && (
          <span className="track-item__eq" aria-hidden="true">
            <span /><span /><span />
          </span>
        )}
        {/* Play-on-hover overlay (hidden when active, shown on hover) */}
        {!isActive && (
          <span className="track-item__play-overlay" aria-hidden="true">
            <Play size={14} fill="currentColor" />
          </span>
        )}
      </div>

      {/* Title + channel */}
      <div className="track-item__info">
        <div className="track-item__title">{track.title}</div>
        <div className="track-item__channel">{track.channelTitle}</div>
      </div>

      {/* Action buttons */}
      <div className="track-item__actions" onClick={e => e.stopPropagation()}>

        {/* Add to queue */}
        <button
          className="track-item__btn"
          data-tooltip="Add to queue"
          aria-label="Add to queue"
          onClick={() => addToQueue(track)}
        >
          <ListEnd size={15} />
        </button>

        {/* Save to playlist */}
        <button
          className="track-item__btn"
          data-tooltip="Save to playlist"
          aria-label="Save to playlist"
          onClick={() => openAddToPlaylist(track)}
        >
          <BookmarkPlus size={15} />
        </button>

        {/* Favorite or remove from playlist */}
        {showRemoveFromPlaylist ? (
          <button
            className="track-item__btn track-item__btn--danger"
            data-tooltip="Remove from playlist"
            aria-label="Remove from playlist"
            onClick={() => removeTrackFromPlaylist(playlistId, track.videoId)}
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <button
            className={`track-item__btn${isFav ? ' track-item__btn--fav' : ''}`}
            data-tooltip={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => toggleFavoriteWithLyrics(track)}
          >
            <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  )
}

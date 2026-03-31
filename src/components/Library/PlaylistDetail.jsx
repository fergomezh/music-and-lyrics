import { ChevronLeft, Play } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { TrackItem } from './TrackItem.jsx'

export function PlaylistDetail() {
  const {
    activePlaylistId,
    playlists,
    getPlaylistTracks,
    setSidebarTab,
    setActivePlaylistId,
    playPlaylist,
  } = usePlayer()

  const playlist = playlists.find(p => p.id === activePlaylistId)
  const tracks   = activePlaylistId ? getPlaylistTracks(activePlaylistId) : []

  const handleBack = () => {
    setSidebarTab('playlists')
    setActivePlaylistId(null)
  }

  if (!playlist) {
    handleBack()
    return null
  }

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__header">
        <button className="playlist-detail__back" onClick={handleBack} aria-label="Back">
          <ChevronLeft size={16} />
        </button>

        <span className="playlist-detail__title">{playlist.name}</span>

        {tracks.length > 0 && (
          <button
            className="playlist-detail__play"
            title="Play all"
            onClick={() => playPlaylist(activePlaylistId)}
          >
            <Play size={12} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="playlist-detail__scroll">
        {tracks.length === 0 ? (
          <p className="playlist-detail__empty">No tracks yet — add some!</p>
        ) : (
          tracks.map(track => (
            <TrackItem
              key={track.videoId}
              track={track}
              playlistId={activePlaylistId}
              showRemoveFromPlaylist
            />
          ))
        )}
      </div>
    </div>
  )
}

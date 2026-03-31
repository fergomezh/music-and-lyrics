import { usePlayer } from '../../context/PlayerContext.jsx'
import { TrackItem } from './TrackItem.jsx'

export function TrackList() {
  const { searchResults, searchLoading, searchError } = usePlayer()

  if (searchError) {
    return (
      <div className="track-list__empty">
        <span style={{ color: '#f87171' }}>{searchError}</span>
      </div>
    )
  }

  if (!searchLoading && searchResults.length === 0) {
    return (
      <div className="track-list__empty">
        Search for a song above to get started
      </div>
    )
  }

  return (
    <div className="track-list">
      {searchResults.map(track => (
        <TrackItem key={track.videoId} track={track} />
      ))}
    </div>
  )
}

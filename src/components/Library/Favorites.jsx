import { useState } from 'react'
import { Download } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { TrackItem } from './TrackItem.jsx'

export function Favorites() {
  const { favorites, exportFavorites } = usePlayer()
  const [filter, setFilter] = useState('')

  const shown = filter.trim()
    ? favorites.filter(f =>
        f.title.toLowerCase().includes(filter.toLowerCase()) ||
        f.channelTitle?.toLowerCase().includes(filter.toLowerCase())
      )
    : favorites

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="favorites__filter">
        <input
          type="text"
          placeholder="Filter favorites…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {favorites.length > 0 && (
          <button
            className="favorites__export"
            onClick={exportFavorites}
            title="Export as JSON"
          >
            <Download size={13} />
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="track-list__empty">
          {favorites.length === 0 ? 'No saved songs yet' : 'No matches'}
        </div>
      ) : (
        <div className="track-list">
          {shown.map(track => (
            <TrackItem key={track.videoId} track={track} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { X, Check, Plus } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { CreatePlaylistModal } from './CreatePlaylistModal.jsx'

export function AddToPlaylistModal() {
  const {
    pendingPlaylistTrack,
    setPendingPlaylistTrack,
    playlists,
    getPlaylistTracks,
    addTrackToPlaylist,
    isTrackInPlaylist,
    setCreatePlaylistOpen,
    createPlaylistOpen,
  } = usePlayer()

  const [justAdded, setJustAdded] = useState(null)

  if (!pendingPlaylistTrack) return null

  const handleClose = () => {
    setPendingPlaylistTrack(null)
    setJustAdded(null)
  }

  const handlePick = (playlistId) => {
    if (isTrackInPlaylist(playlistId, pendingPlaylistTrack.videoId)) return
    addTrackToPlaylist(playlistId, pendingPlaylistTrack)
    setJustAdded(playlistId)
    setTimeout(() => {
      setPendingPlaylistTrack(null)
      setJustAdded(null)
    }, 700)
  }

  const handleNewPlaylist = () => {
    setCreatePlaylistOpen(true)
  }

  return (
    <>
      <div className="playlist-modal__overlay" onClick={handleClose}>
        <div className="playlist-modal" onClick={e => e.stopPropagation()}>
          <button className="playlist-modal__close" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>

          <div className="playlist-modal__title">ADD TO PLAYLIST</div>
          <div className="playlist-modal__track-name">{pendingPlaylistTrack.title}</div>

          <div className="playlist-modal__list">
            {playlists.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-ghost)', padding: '8px 0', textAlign: 'center' }}>
                No playlists yet
              </p>
            ) : (
              playlists.map(pl => {
                const trackCount = getPlaylistTracks(pl.id).length
                const alreadyIn  = isTrackInPlaylist(pl.id, pendingPlaylistTrack.videoId)
                const added      = justAdded === pl.id

                return (
                  <div
                    key={pl.id}
                    className="playlist-pick-item"
                    onClick={() => handlePick(pl.id)}
                    style={{ opacity: alreadyIn ? 0.5 : 1, cursor: alreadyIn ? 'default' : 'pointer' }}
                  >
                    <span className="playlist-pick-item__name">{pl.name}</span>
                    <span className="playlist-pick-item__count">{trackCount}</span>
                    {(alreadyIn || added) && (
                      <span className="playlist-pick-item__check">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <button className="playlist-modal__new-btn" onClick={handleNewPlaylist}>
            <Plus size={14} />
            New playlist
          </button>
        </div>
      </div>

      {createPlaylistOpen && (
        <CreatePlaylistModal
          onClose={() => setCreatePlaylistOpen(false)}
          onCreated={(id) => {
            setJustAdded(id)
            setTimeout(() => {
              setPendingPlaylistTrack(null)
              setJustAdded(null)
            }, 700)
          }}
        />
      )}
    </>
  )
}

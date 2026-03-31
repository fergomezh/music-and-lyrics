import { useState } from 'react'
import { X } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

export function CreatePlaylistModal({ onClose, onCreated }) {
  const { createPlaylist, addTrackToPlaylist, pendingPlaylistTrack } = usePlayer()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Name is required'); return }

    const id = createPlaylist(trimmed)

    // If opened from AddToPlaylistModal, auto-add the pending track
    if (pendingPlaylistTrack) {
      addTrackToPlaylist(id, pendingPlaylistTrack)
    }

    onCreated?.(id)
    onClose()
  }

  return (
    <div className="playlist-modal__overlay" onClick={onClose}>
      <div className="playlist-modal" onClick={e => e.stopPropagation()}>
        <button className="playlist-modal__close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className="playlist-modal__title">NEW PLAYLIST</div>

        <form className="playlist-form" onSubmit={handleSubmit}>
          <input
            className="playlist-form__input"
            type="text"
            placeholder="Playlist name"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            maxLength={80}
            autoFocus
            required
          />
          {error && <p className="playlist-form__error">{error}</p>}
          <button className="playlist-form__submit" type="submit">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}

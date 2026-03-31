import { useState, useRef, useEffect } from 'react'
import { Plus, ListMusic, Pencil, Trash2 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { CreatePlaylistModal } from './CreatePlaylistModal.jsx'

function PlaylistItem({ playlist, trackCount }) {
  const { setSidebarTab, setActivePlaylistId, renamePlaylist, deletePlaylist } = usePlayer()
  const [renaming, setRenaming] = useState(false)
  const [nameValue, setNameValue] = useState(playlist.name)
  const inputRef = useRef(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  const commitRename = () => {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== playlist.name) {
      renamePlaylist(playlist.id, trimmed)
    } else {
      setNameValue(playlist.name)
    }
    setRenaming(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') { setNameValue(playlist.name); setRenaming(false) }
  }

  const handleOpen = () => {
    setActivePlaylistId(playlist.id)
    setSidebarTab('playlist-detail')
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id)
    }
  }

  const handleRename = (e) => {
    e.stopPropagation()
    setRenaming(true)
  }

  return (
    <div className="playlist-item" onClick={renaming ? undefined : handleOpen}>
      <div className="playlist-item__icon">
        <ListMusic size={14} />
      </div>

      <div className="playlist-item__info">
        {renaming ? (
          <input
            ref={inputRef}
            className="playlist-item__name-input"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            maxLength={80}
          />
        ) : (
          <div className="playlist-item__name">{playlist.name}</div>
        )}
        <div className="playlist-item__count">
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </div>
      </div>

      <div className="playlist-item__actions">
        <button
          className="playlist-item__action"
          title="Rename"
          onClick={handleRename}
        >
          <Pencil size={12} />
        </button>
        <button
          className="playlist-item__action playlist-item__action--danger"
          title="Delete"
          onClick={handleDelete}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export function PlaylistList() {
  const { playlists, getPlaylistTracks, setCreatePlaylistOpen, createPlaylistOpen } = usePlayer()

  return (
    <div className="playlist-list">
      <div className="playlist-list__header">
        <span className="playlist-list__title">Playlists</span>
        <button
          className="playlist-list__add"
          title="New playlist"
          onClick={() => setCreatePlaylistOpen(true)}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="playlist-list__scroll">
        {playlists.length === 0 ? (
          <p className="playlist-list__empty">No playlists yet</p>
        ) : (
          playlists.map(pl => (
            <PlaylistItem
              key={pl.id}
              playlist={pl}
              trackCount={getPlaylistTracks(pl.id).length}
            />
          ))
        )}
      </div>

      {createPlaylistOpen && (
        <CreatePlaylistModal onClose={() => setCreatePlaylistOpen(false)} />
      )}
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { Disc3 } from 'lucide-react'
import { SearchBar } from '../Library/SearchBar.jsx'
import { TrackList } from '../Library/TrackList.jsx'
import { Favorites } from '../Library/Favorites.jsx'
import { PlaylistList } from '../Library/PlaylistList.jsx'
import { PlaylistDetail } from '../Library/PlaylistDetail.jsx'
import { UserWidget } from '../Auth/UserWidget.jsx'
import { AuthModal } from '../Auth/AuthModal.jsx'
import { MigrationBanner } from '../Auth/MigrationBanner.jsx'
import { usePlayer } from '../../context/PlayerContext.jsx'

const DISMISSED_KEY = 'ml_migration_dismissed'
const SIDEBAR_WIDTH_KEY = 'ml_sidebar_width'
const MIN_WIDTH = 220
const MAX_WIDTH = 520

export function Sidebar() {
  const { sidebarTab, setSidebarTab, migrateLocalToCloud, migratePlaylistsToCloud } = usePlayer()
  const [authOpen, setAuthOpen] = useState(false)
  const [migrationCount, setMigrationCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const widthRef = useRef(
    Math.max(MIN_WIDTH, Math.min(MAX_WIDTH,
      parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY) || '300', 10)
    ))
  )

  // Apply saved width on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', widthRef.current + 'px')
  }, [])

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = widthRef.current
    setIsDragging(true)

    const onMouseMove = (e) => {
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + (e.clientX - startX)))
      widthRef.current = newWidth
      document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px')
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = ''
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(widthRef.current))
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.body.style.userSelect = 'none'

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const handleSignedIn = () => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    try {
      const localFavs = JSON.parse(localStorage.getItem('ml_favorites') || '[]')
      if (localFavs.length > 0) setMigrationCount(localFavs.length)
    } catch { /* ignore */ }
  }

  const handleMigrate = async () => {
    await Promise.all([
      migrateLocalToCloud(),
      migratePlaylistsToCloud(),
    ])
    setMigrationCount(0)
  }

  return (
    <aside className="sidebar">
      <div
        className={`sidebar__resize-handle${isDragging ? ' sidebar__resize-handle--dragging' : ''}`}
        onMouseDown={handleResizeMouseDown}
      />
      <div className="sidebar__logo">
        <Disc3 size={20} />
        <span>Music &amp; Lyrics</span>
      </div>

      {migrationCount > 0 && (
        <MigrationBanner
          count={migrationCount}
          onMigrate={handleMigrate}
          onDismiss={() => setMigrationCount(0)}
        />
      )}

      <div className="sidebar__tabs">
        <button
          className={`sidebar__tab${sidebarTab === 'search' ? ' sidebar__tab--active' : ''}`}
          onClick={() => setSidebarTab('search')}
        >
          Library
        </button>
        <button
          className={`sidebar__tab${sidebarTab === 'favorites' ? ' sidebar__tab--active' : ''}`}
          onClick={() => setSidebarTab('favorites')}
        >
          Favorites
        </button>
        <button
          className={`sidebar__tab${(sidebarTab === 'playlists' || sidebarTab === 'playlist-detail') ? ' sidebar__tab--active' : ''}`}
          onClick={() => setSidebarTab('playlists')}
        >
          Playlists
        </button>
      </div>

      <div className="sidebar__content">
        {sidebarTab === 'search' && (
          <>
            <SearchBar />
            <TrackList />
          </>
        )}
        {sidebarTab === 'favorites' && <Favorites />}
        {sidebarTab === 'playlists' && <PlaylistList />}
        {sidebarTab === 'playlist-detail' && <PlaylistDetail />}
      </div>

      <UserWidget onOpenAuth={() => setAuthOpen(true)} />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignedIn={handleSignedIn}
        />
      )}
    </aside>
  )
}

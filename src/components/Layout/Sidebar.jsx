import { useState } from 'react'
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

export function Sidebar() {
  const { sidebarTab, setSidebarTab, migrateLocalToCloud, migratePlaylistsToCloud } = usePlayer()
  const [authOpen, setAuthOpen] = useState(false)
  const [migrationCount, setMigrationCount] = useState(0)

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

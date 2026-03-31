import { useState } from 'react'
import { Search, Music, Heart, Play, Pause, ListMusic, ChevronUp, ChevronDown, Maximize2, Minimize2, User, LogOut, Mic2 } from 'lucide-react'
import { Sidebar } from './Sidebar.jsx'
import { TrackInfo } from '../Player/TrackInfo.jsx'
import { PlayerControls } from '../Player/PlayerControls.jsx'
import { VolumeControl } from '../Player/VolumeControl.jsx'
import { LyricsPanel } from '../Lyrics/LyricsPanel.jsx'
import { SearchBar } from '../Library/SearchBar.jsx'
import { TrackList } from '../Library/TrackList.jsx'
import { Favorites } from '../Library/Favorites.jsx'
import { LyricsDisplay } from '../Lyrics/LyricsDisplay.jsx'
import { PlaylistList } from '../Library/PlaylistList.jsx'
import { PlaylistDetail } from '../Library/PlaylistDetail.jsx'
import { AddToPlaylistModal } from '../Library/AddToPlaylistModal.jsx'
import { AuthModal } from '../Auth/AuthModal.jsx'
import { MigrationBanner } from '../Auth/MigrationBanner.jsx'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const DISMISSED_KEY = 'ml_migration_dismissed'

function initials(email) {
  if (!email) return '?'
  const [local] = email.split('@')
  const parts = local.split(/[._-]/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.slice(0, 2).toUpperCase()
}

export function MainLayout() {
  const [mobileTab, setMobileTab] = useState('search')
  const [mobileLyricsOpen, setMobileLyricsOpen] = useState(false)
  const [mobileLyricsFullscreen, setMobileLyricsFullscreen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [migrationCount, setMigrationCount] = useState(0)

  const { currentTrack, isPlaying, play, pause, lyricsMaximized, currentTime, duration, activePlaylistId, migrateLocalToCloud, migratePlaylistsToCloud, lyricsLoading, lyricsError, lyrics } = usePlayer()
  const { user, signOut } = useAuth()

  const handleSignedIn = () => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    try {
      const localFavs = JSON.parse(localStorage.getItem('ml_favorites') || '[]')
      if (localFavs.length > 0) setMigrationCount(localFavs.length)
    } catch { /* ignore */ }
  }

  const handleMigrate = async () => {
    await Promise.all([migrateLocalToCloud(), migratePlaylistsToCloud()])
    setMigrationCount(0)
  }

  const renderMobileLyrics = () => {
    if (lyricsLoading) {
      return (
        <div className="lyrics-placeholder">
          {[80, 60, 90, 50, 75, 55, 85].map((w, i) => (
            <div key={i} className="lyrics-placeholder__line" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )
    }
    if (lyricsError === 'not_found' || (!lyrics.lines.length && !lyrics.plainLyrics)) {
      const geniusQuery = encodeURIComponent(`${currentTrack?.title ?? ''} ${currentTrack?.channelTitle ?? ''}`)
      return (
        <div className="lyrics-empty">
          <Mic2 size={36} strokeWidth={1} />
          <span>Lyrics not available</span>
          <a className="lyrics-empty__link" href={`https://genius.com/search?q=${geniusQuery}`} target="_blank" rel="noopener noreferrer">
            Search on Genius →
          </a>
        </div>
      )
    }
    return <LyricsDisplay />
  }

  return (
    <>
      {/* ── Desktop / Tablet ── */}
      <div className={`app${lyricsMaximized ? ' app--lyrics-maximized' : ''}`}>
        <Sidebar />

        <main className="main-player">
          {currentTrack && (
            <div
              className="main-player__glow"
              style={{ backgroundImage: `url(${currentTrack.thumbnailUrl})` }}
            />
          )}
          <TrackInfo />
          <PlayerControls />
          <VolumeControl />
        </main>

        <LyricsPanel />
      </div>

      {/* ── Mobile Tab Bar ── */}
      <nav className="mobile-tabs">
        {migrationCount > 0 && (
          <MigrationBanner
            count={migrationCount}
            onMigrate={handleMigrate}
            onDismiss={() => setMigrationCount(0)}
          />
        )}
        <div className="mobile-tabs__bar">
          {[
            { id: 'search', icon: Search, label: 'Search' },
            { id: 'playing', icon: Music, label: 'Playing' },
            { id: 'favorites', icon: Heart, label: 'Favorites' },
            { id: 'playlists', icon: ListMusic, label: 'Playlists' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`mobile-tab${mobileTab === id ? ' mobile-tab--active' : ''}`}
              onClick={() => setMobileTab(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
          {user ? (
            <div className="mobile-user">
              <div className="mobile-user__avatar" onClick={() => signOut()} title="Sign out">
                {initials(user.email)}
                <span className="mobile-user__signout"><LogOut size={12} /></span>
              </div>
            </div>
          ) : (
            <button className="mobile-user mobile-user--signin" onClick={() => setAuthOpen(true)}>
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Panels ── */}
      <div className={`mobile-panel${mobileTab === 'search' ? ' mobile-panel--active' : ''}`}>
        <SearchBar />
        <div className="mobile-panel__scroll">
          <TrackList />
        </div>
      </div>

      <div className={`mobile-panel${mobileTab === 'playing' ? ' mobile-panel--active' : ''}`}>
        {mobileLyricsFullscreen ? (
          /* ── Fullscreen lyrics ── */
          <div className="mobile-lyrics-fullscreen">
            <div className="mobile-lyrics-fullscreen__header">
              <span className="mobile-lyrics-fullscreen__track">
                {currentTrack?.title ?? 'No track playing'}
              </span>
              <button
                className="mobile-lyrics-fullscreen__close"
                onClick={() => setMobileLyricsFullscreen(false)}
              >
                <Minimize2 size={14} />
                <span>Minimize</span>
              </button>
            </div>
            <div className="mobile-lyrics-fullscreen__scroll">
              {renderMobileLyrics()}
            </div>
          </div>
        ) : (
          /* ── Normal player + optional inline lyrics ── */
          <div className="mobile-panel__scroll mobile-panel__scroll--playing">
            <TrackInfo />
            <PlayerControls />
            <VolumeControl />
            <div className={`mobile-lyrics${mobileLyricsOpen ? ' mobile-lyrics--open' : ''}`}>
              <div className="mobile-lyrics__bar">
                <button
                  className="mobile-lyrics__toggle"
                  onClick={() => setMobileLyricsOpen(v => !v)}
                >
                  {mobileLyricsOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  <span>{mobileLyricsOpen ? 'Hide lyrics' : 'Show lyrics'}</span>
                </button>
                {mobileLyricsOpen && (
                  <button
                    className="mobile-lyrics__expand"
                    onClick={() => setMobileLyricsFullscreen(true)}
                    aria-label="Maximize lyrics"
                  >
                    <Maximize2 size={14} />
                  </button>
                )}
              </div>
              {mobileLyricsOpen && (
                <div className="mobile-lyrics__scroll">
                  {renderMobileLyrics()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`mobile-panel${mobileTab === 'favorites' ? ' mobile-panel--active' : ''}`}>
        <Favorites />
      </div>

      <div className={`mobile-panel${mobileTab === 'playlists' ? ' mobile-panel--active' : ''}`}>
        <div className="mobile-panel__scroll">
          {activePlaylistId ? <PlaylistDetail /> : <PlaylistList />}
        </div>
      </div>

      {/* ── Global Modals ── */}
      <AddToPlaylistModal />
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignedIn={handleSignedIn}
        />
      )}

      {/* ── Mobile Bottom Mini-Player ── */}
      <div className="mobile-player">
        {currentTrack && duration > 0 && (
          <div
            className="mobile-player__progress"
            style={{ '--pct': `${(currentTime / duration) * 100}%` }}
          />
        )}
        {currentTrack ? (
          <>
            <img
              src={currentTrack.thumbnailUrl}
              alt=""
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                {currentTrack.channelTitle}
              </div>
            </div>
            <button
              onClick={isPlaying ? pause : play}
              style={{ padding: 8, color: 'var(--accent)' }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No track playing</div>
        )}
      </div>
    </>
  )
}
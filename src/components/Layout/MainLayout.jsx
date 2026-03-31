import { useState } from 'react'
import { Search, Music, Heart, Play, Pause, ListMusic, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
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
import { usePlayer } from '../../context/PlayerContext.jsx'

export function MainLayout() {
  const [mobileTab, setMobileTab] = useState('search')
  const [mobileLyricsOpen, setMobileLyricsOpen] = useState(false)
  const [mobileLyricsFullscreen, setMobileLyricsFullscreen] = useState(false)
  const { currentTrack, isPlaying, play, pause, lyricsMaximized, currentTime, duration, activePlaylistId } = usePlayer()

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
              <LyricsDisplay />
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
                  <LyricsDisplay />
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
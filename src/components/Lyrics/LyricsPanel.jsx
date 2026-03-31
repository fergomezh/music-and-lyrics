import { useRef, useCallback } from 'react'
import { Mic2, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { LyricsDisplay } from './LyricsDisplay.jsx'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { formatTime } from '../../utils/timeUtils.js'

export function LyricsPanel() {
  const {
    currentTrack, lyricsLoading, lyricsError, lyrics,
    lyricsMaximized, toggleLyricsMaximized,
    isPlaying, play, pause, prevTrack, nextTrack,
    currentTime, duration, seekTo,
  } = usePlayer()

  const progressRef = useRef(null)
  const handleSeek = useCallback((e) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * duration)
  }, [seekTo, duration])
  const progress = duration ? (currentTime / duration) * 100 : 0

  const renderContent = () => {
    if (!currentTrack) {
      return (
        <div className="lyrics-empty">
          <Mic2 size={36} strokeWidth={1} />
          <span>Play a song to see lyrics</span>
        </div>
      )
    }

    if (lyricsLoading) {
      return (
        <div className="lyrics-placeholder">
          {[80, 60, 90, 50, 75, 55, 85].map((w, i) => (
            <div
              key={i}
              className="lyrics-placeholder__line"
              style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )
    }

    if (lyricsError === 'not_found' || (!lyrics.lines.length && !lyrics.plainLyrics)) {
      const { title = '', channelTitle = '' } = currentTrack
      const geniusQuery = encodeURIComponent(`${title} ${channelTitle}`)
      return (
        <div className="lyrics-empty">
          <Mic2 size={36} strokeWidth={1} />
          <span>Lyrics not available</span>
          <a
            className="lyrics-empty__link"
            href={`https://genius.com/search?q=${geniusQuery}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search on Genius →
          </a>
        </div>
      )
    }

    return (
      <div className="lyrics-scroll">
        <LyricsDisplay />
      </div>
    )
  }

  return (
    <aside className={`lyrics-panel${lyricsMaximized ? ' lyrics-panel--maximized' : ''}`}>
      <div className="lyrics-panel__header">
        <div className="lyrics-panel__label">Lyrics</div>
        {currentTrack && (
          <div className="lyrics-panel__track">
            {currentTrack.title} · {currentTrack.channelTitle}
          </div>
        )}
        <button
          className="lyrics-panel__toggle"
          onClick={toggleLyricsMaximized}
          aria-label={lyricsMaximized ? 'Minimize lyrics' : 'Maximize lyrics'}
          title={lyricsMaximized ? 'Minimize lyrics' : 'Maximize lyrics'}
        >
          {lyricsMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      {renderContent()}
      
      {/* Mini-player shown when lyrics are maximized */}
      {lyricsMaximized && currentTrack && (
        <div className="lyrics-panel__mini-player">
          <div className="lyrics-panel__mini-progress">
            <div
              className="progress-bar__track"
              ref={progressRef}
              onClick={handleSeek}
              role="slider"
              aria-label="Seek"
              aria-valuenow={Math.round(currentTime)}
              aria-valuemax={Math.round(duration)}
            >
              <div className="progress-bar__fill" style={{ width: `${progress}%` }}>
                <div className="progress-bar__thumb" />
              </div>
            </div>
            <div className="progress-bar__times">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="lyrics-panel__mini-row">
            <img
              src={currentTrack.thumbnailUrl}
              alt=""
              className="lyrics-panel__mini-art"
            />
            <div className="lyrics-panel__mini-info">
              <div className="lyrics-panel__mini-title">{currentTrack.title}</div>
              <div className="lyrics-panel__mini-artist">{currentTrack.channelTitle}</div>
            </div>
            <div className="lyrics-panel__mini-controls">
              <button onClick={prevTrack} aria-label="Previous">
                <SkipBack size={18} />
              </button>
              <button
                className="lyrics-panel__mini-play"
                onClick={isPlaying ? pause : play}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={nextTrack} aria-label="Next">
                <SkipForward size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
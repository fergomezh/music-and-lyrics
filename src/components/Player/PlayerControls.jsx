import { useRef, useCallback } from 'react'
import { SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { formatTime } from '../../utils/timeUtils.js'

export function PlayerControls() {
  const {
    isPlaying, currentTime, duration,
    play, pause, seekTo, nextTrack, prevTrack,
    repeatMode, cycleRepeatMode,
    isShuffled, toggleShuffle,
  } = usePlayer()

  const trackRef = useRef(null)

  const handleSeek = useCallback((e) => {
    if (!trackRef.current || !duration) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekTo(ratio * duration)
  }, [seekTo, duration])

  const progress = duration ? (currentTime / duration) * 100 : 0

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat

  return (
    <div className="player-controls">
      <div className="progress-bar">
        <div
          className="progress-bar__track"
          ref={trackRef}
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

      <div className="controls">
        <button
          className={`controls__btn${isShuffled ? ' controls__btn--active' : ''}`}
          onClick={toggleShuffle}
          aria-label="Shuffle"
          title="Shuffle"
        >
          <Shuffle size={16} />
        </button>

        <button className="controls__btn" onClick={prevTrack} aria-label="Previous">
          <SkipBack size={20} />
        </button>

        <button
          className="controls__btn controls__btn--play"
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button className="controls__btn" onClick={nextTrack} aria-label="Next">
          <SkipForward size={20} />
        </button>

        <button
          className={`controls__btn${repeatMode !== 'off' ? ' controls__btn--active' : ''}`}
          onClick={cycleRepeatMode}
          aria-label={`Repeat: ${repeatMode}`}
          title={`Repeat: ${repeatMode}`}
        >
          <RepeatIcon size={16} />
        </button>
      </div>
    </div>
  )
}

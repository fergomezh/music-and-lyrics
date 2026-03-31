import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5]

export function VolumeControl() {
  const { volume, isMuted, setVolume, setMuted, playbackRate, setPlaybackRate } = usePlayer()

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 40 ? Volume1 : volume < 70 ? Volume : Volume2
  const fillPercent = isMuted ? 0 : volume

  return (
    <div className="volume-control">
      <button
        className="volume-control__btn"
        onClick={() => setMuted(!isMuted)}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={18} />
      </button>

      <input
        type="range"
        className="volume-control__slider"
        min={0}
        max={100}
        value={fillPercent}
        style={{ '--fill': `${fillPercent}%` }}
        onChange={e => { setMuted(false); setVolume(Number(e.target.value)) }}
        aria-label="Volume"
      />

      <div className="speed-pills">
        {SPEED_OPTIONS.map(rate => (
          <button
            key={rate}
            className={`speed-pill${playbackRate === rate ? ' speed-pill--active' : ''}`}
            onClick={() => setPlaybackRate(rate)}
            aria-label={`${rate}× playback speed`}
          >
            {rate === 1 ? '1×' : `${rate}×`}
          </button>
        ))}
      </div>
    </div>
  )
}

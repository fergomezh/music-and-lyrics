import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

export function VolumeControl() {
  const { volume, isMuted, setVolume, setMuted, playbackRate, setPlaybackRate } = usePlayer()

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 40 ? Volume1 : volume < 70 ? Volume : Volume2

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
        value={isMuted ? 0 : volume}
        onChange={e => { setMuted(false); setVolume(Number(e.target.value)) }}
        aria-label="Volume"
      />

      <div className="speed-pills">
        {SPEEDS.map(s => (
          <button
            key={s}
            className={`speed-pill${playbackRate === s ? ' speed-pill--active' : ''}`}
            onClick={() => setPlaybackRate(s)}
            aria-label={`${s}x speed`}
          >
            {s === 1 ? '1×' : `${s}×`}
          </button>
        ))}
      </div>
    </div>
  )
}

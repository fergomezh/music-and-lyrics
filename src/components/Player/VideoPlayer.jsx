import { usePlayer } from '../../context/PlayerContext.jsx'

/**
 * Renders the YouTube IFrame API container div.
 * Must be mounted at App root (sibling of MainLayout, never a child of it)
 * so the container is in the DOM before PlayerContext initializes YT.Player.
 */
export function VideoPlayer() {
  const { ytContainerRef } = usePlayer()
  return (
    <div
      ref={ytContainerRef}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        top: '-9999px',
        left: '-9999px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  )
}

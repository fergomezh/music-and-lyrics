/**
 * Single lyric line. Visual state is driven entirely by the `status` prop
 * mapped to CSS classes — no inline styles needed.
 *
 * @param {{ text: string, status: 'active'|'past'|'future', onClick: () => void, lineRef: React.Ref }} props
 */
export function LyricLine({ text, status, onClick, lineRef }) {
  return (
    <button
      ref={lineRef}
      className={`lyric-line lyric-line--${status}`}
      onClick={onClick}
      aria-current={status === 'active' ? 'true' : undefined}
    >
      {text}
    </button>
  )
}

import { useRef, useEffect, useCallback } from 'react'
import { LyricLine } from './LyricLine.jsx'
import { usePlayer } from '../../context/PlayerContext.jsx'

/**
 * Maps lyric lines to LyricLine components. Smoothly scrolls the active line
 * to center on every activeIndex change.
 *
 * Plain lyrics (no timestamps) render as a scrollable pre block.
 */
export function LyricsDisplay() {
  const { lyrics, activeLyricIndex, seekTo } = usePlayer()
  const lineRefs = useRef({})
  const containerRef = useRef(null)

  // Find the scrollable parent (.lyrics-scroll)
  const getScrollableParent = useCallback((el) => {
    let parent = el?.parentElement
    while (parent) {
      const style = window.getComputedStyle(parent)
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return parent
      }
      parent = parent.parentElement
    }
    return null
  }, [])

  // Auto-scroll active line to center within scrollable container only
  useEffect(() => {
    if (activeLyricIndex < 0) return
    const el = lineRefs.current[activeLyricIndex]
    if (!el) return

    // Find the scrollable parent instead of using scrollIntoView
    const scrollContainer = getScrollableParent(el)
    if (!scrollContainer) return

    const containerRect = scrollContainer.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const scrollOffset = elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2)
    
    scrollContainer.scrollBy({
      top: scrollOffset,
      behavior: 'smooth'
    })
  }, [activeLyricIndex, getScrollableParent])

  const getRef = useCallback((index) => (el) => {
    lineRefs.current[index] = el
  }, [])

  // Synced lyrics
  if (lyrics.lines.length > 0) {
    return (
      <div ref={containerRef} className="lyrics-display-container">
        {lyrics.lines.map((line, i) => {
          const status = i === activeLyricIndex ? 'active' : i < activeLyricIndex ? 'past' : 'future'
          return (
            <LyricLine
              key={i}
              text={line.text}
              status={status}
              lineRef={getRef(i)}
              onClick={() => seekTo(line.time / 1000)}
            />
          )
        })}
      </div>
    )
  }

  // Plain lyrics fallback
  if (lyrics.plainLyrics) {
    return <pre className="lyrics-plain">{lyrics.plainLyrics}</pre>
  }

  return null
}

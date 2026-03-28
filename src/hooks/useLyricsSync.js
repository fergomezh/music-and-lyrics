import { useMemo } from 'react'
import { findActiveLyricIndex } from '../utils/lyricsParser.js'

/**
 * Converts currentTime (seconds from YouTube player) to the index
 * of the currently active lyric line using binary search.
 *
 * @param {{ time: number, text: string }[]} lines - sorted ascending by time (ms)
 * @param {number} currentTime - seconds
 * @returns {{ activeIndex: number }}
 */
export function useLyricsSync(lines, currentTime) {
  const activeIndex = useMemo(
    () => findActiveLyricIndex(lines, currentTime * 1000),
    [lines, currentTime]
  )
  return { activeIndex }
}

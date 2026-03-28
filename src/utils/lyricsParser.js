/**
 * Parses LRC (LyRiCs) format text into a sorted array of timed lyric lines.
 *
 * LRC format: [mm:ss.xx] lyric text
 *
 * Handles:
 *   - [mm:ss.xx] and [mm:ss] timestamps
 *   - Multiple timestamps on one line: [00:12.00][00:45.00] text
 *   - Metadata tags [ti:] [ar:] [al:] [by:] — skipped
 *   - Empty text lines → stored as '♪'
 *   - 2 or 3 digit centiseconds, both normalized to milliseconds
 *
 * @param {string|null} lrcText
 * @returns {{ time: number, text: string }[]} sorted by time ascending
 */
// Hoisted to module level — RegExp creation is expensive; avoid recreating
// on every parseLRC() call (js-hoist-regexp best practice).
const TIME_REGEX = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g
const META_REGEX = /^\[(?:ti|ar|al|by|offset|re|ve):.*\]$/i
const TIMESTAMP_STRIP_REGEX = /\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g

export function parseLRC(lrcText) {
  if (!lrcText) return []

  const result = []

  for (const raw of lrcText.split('\n')) {
    const line = raw.trim()
    if (!line || META_REGEX.test(line)) continue

    const timestamps = []
    let match
    TIME_REGEX.lastIndex = 0

    while ((match = TIME_REGEX.exec(line)) !== null) {
      const mins = parseInt(match[1], 10)
      const secs = parseInt(match[2], 10)
      const cs = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
      timestamps.push((mins * 60 + secs) * 1000 + cs)
    }

    if (!timestamps.length) continue

    const text = line.replace(TIMESTAMP_STRIP_REGEX, '').trim()
    for (const time of timestamps) {
      result.push({ time, text: text || '♪' })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

/**
 * Binary search: find the index of the last lyric line whose timestamp
 * is <= currentTimeMs. Returns -1 if before the first line.
 *
 * O(log n) — called on every 500ms poll tick.
 *
 * @param {{ time: number }[]} lines - sorted ascending
 * @param {number} currentTimeMs
 * @returns {number}
 */
export function findActiveLyricIndex(lines, currentTimeMs) {
  if (!lines?.length) return -1

  let left = 0
  let right = lines.length - 1
  let result = -1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (lines[mid].time <= currentTimeMs) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}

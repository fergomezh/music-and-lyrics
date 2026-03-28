/**
 * Formats a duration in seconds to "m:ss" string.
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Extracts artist and track name from a YouTube video title.
 * Tries "Artist - Track" split first, then falls back to channelTitle as artist.
 */
export function parseYouTubeTitle(title, channelTitle = '') {
  const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (dashMatch) {
    const artist = dashMatch[1].trim()
    const track = dashMatch[2]
      .replace(/\s*(?:\(.*?\)|\[.*?\])\s*/g, '')
      .replace(/\s*(?:official|video|lyrics|audio|hd|4k|mv|ft\b|feat\b).*$/i, '')
      .trim()
    if (artist && track) return { artist, track }
  }

  const track = title
    .replace(/\s*(?:\(.*?\)|\[.*?\])\s*/g, '')
    .replace(/\s*(?:official|video|lyrics|audio|hd|4k|mv).*$/i, '')
    .trim() || title

  const artist = channelTitle
    .replace(/\s*(?:VEVO|Official|Music|Topic|Records|Entertainment|Channel)\s*$/i, '')
    .trim() || channelTitle

  return { artist, track }
}

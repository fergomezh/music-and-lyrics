const BASE_URL = 'https://lrclib.net/api'

/**
 * Fetches synchronized lyrics from lrclib.net.
 *
 * Strategy:
 *   1. Exact match: GET /get?track_name=X&artist_name=Y[&duration=N]
 *   2. Fuzzy search: GET /search?q=X+Y — prefer results with syncedLyrics
 *
 * @param {{ trackName: string, artistName: string, duration?: number }} params
 * @returns {Promise<{ syncedLyrics: string|null, plainLyrics: string|null, trackName: string, artistName: string } | null>}
 */
export async function getLyrics({ trackName, artistName, duration } = {}) {
  if (!trackName) return null

  // 1. Exact match
  try {
    const qs = new URLSearchParams({ track_name: trackName, artist_name: artistName || '' })
    if (duration) qs.set('duration', String(Math.round(duration)))
    const res = await fetch(`${BASE_URL}/get?${qs}`)
    if (res.ok) {
      const d = await res.json()
      if (d.syncedLyrics || d.plainLyrics) {
        return {
          syncedLyrics: d.syncedLyrics || null,
          plainLyrics: d.plainLyrics || null,
          trackName: d.trackName || trackName,
          artistName: d.artistName || artistName,
        }
      }
    }
  } catch { /* fall through */ }

  // 2. Fuzzy search
  try {
    const qs = new URLSearchParams({ q: `${trackName} ${artistName || ''}`.trim() })
    const res = await fetch(`${BASE_URL}/search?${qs}`)
    if (res.ok) {
      const items = await res.json()
      if (Array.isArray(items) && items.length) {
        const best = items.find(i => i.syncedLyrics) || items[0]
        if (best.syncedLyrics || best.plainLyrics) {
          return {
            syncedLyrics: best.syncedLyrics || null,
            plainLyrics: best.plainLyrics || null,
            trackName: best.trackName || trackName,
            artistName: best.artistName || artistName,
          }
        }
      }
    }
  } catch { /* network failure */ }

  return null
}

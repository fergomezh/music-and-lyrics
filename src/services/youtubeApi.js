const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Decode HTML entities returned by the YouTube API (e.g. &amp; → &, &quot; → ") */
function decodeHtml(str) {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  return doc.body.textContent ?? str
}

function getCached(query) {
  try {
    const raw = sessionStorage.getItem(`yt_search_${query}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) { sessionStorage.removeItem(`yt_search_${query}`); return null }
    return data
  } catch { return null }
}

function setCache(query, data) {
  try { sessionStorage.setItem(`yt_search_${query}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* quota */ }
}

/**
 * Search YouTube for music videos.
 * Caches results in sessionStorage for 1 hour to preserve API quota.
 *
 * @param {string} query
 * @returns {Promise<Array<{ videoId, title, channelTitle, thumbnailUrl, publishedAt }>>}
 * @throws Error with user-friendly message on quota exceeded or missing key
 */
export async function searchSongs(query) {
  if (!API_KEY) throw new Error('YouTube API key not configured. Add VITE_YOUTUBE_API_KEY to your .env file.')

  const cached = getCached(query)
  if (cached) return cached

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    q: query,
    maxResults: '20',
    key: API_KEY,
  })

  const res = await fetch(`${BASE_URL}/search?${params}`)

  if (!res.ok) {
    if (res.status === 403) throw new Error('YouTube API quota exceeded. Resets at midnight Pacific Time.')
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `YouTube API error ${res.status}`)
  }

  const data = await res.json()
  const results = (data.items || []).map(item => ({
    videoId: item.id.videoId,
    title: decodeHtml(item.snippet.title),
    channelTitle: decodeHtml(item.snippet.channelTitle),
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url ||
      '',
    publishedAt: item.snippet.publishedAt,
  }))

  setCache(query, results)
  return results
}

/**
 * Returns YouTube thumbnail URLs for a given videoId (no API key needed).
 */
export function getYouTubeThumbnails(videoId) {
  return {
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
  }
}

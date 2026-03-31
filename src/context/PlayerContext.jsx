import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { usePlaylists } from '../hooks/usePlaylists.js'
import { useLyricsSync } from '../hooks/useLyricsSync.js'
import { getLyrics } from '../services/lyricsApi.js'
import { searchSongs } from '../services/youtubeApi.js'
import { parseLRC } from '../utils/lyricsParser.js'
import { parseYouTubeTitle } from '../utils/timeUtils.js'

const PlayerContext = createContext(null)

const REPEAT_MODES = ['off', 'all', 'one']

export function PlayerProvider({ children }) {
  // ── Queue ──────────────────────────────────────────────────────────────────
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [repeatMode, setRepeatModeState] = useState('off')
  const [isShuffled, setIsShuffled] = useState(false)

  // ── Player settings ────────────────────────────────────────────────────────
  const [volume, setVolumeState] = useState(
    () => parseInt(localStorage.getItem('ml_volume') ?? '80', 10)
  )
  const [isMuted, setIsMutedState] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)

  // ── Lyrics ─────────────────────────────────────────────────────────────────
  const [lyrics, setLyrics] = useState({ syncedLyrics: null, plainLyrics: null, lines: [] })
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState(null)

  // ── Search ─────────────────────────────────────────────────────────────────
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // ── UI state ───────────────────────────────────────────────────────────────
  const [sidebarTab, setSidebarTab] = useState('search')
  const [lyricsMaximized, setLyricsMaximized] = useState(false)

  const toggleLyricsMaximized = useCallback(() => {
    setLyricsMaximized(prev => !prev)
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentTrack = queue[currentIndex] ?? null
  const nextTrackRef = useRef(null)

  // ── YouTube player ─────────────────────────────────────────────────────────
  const yt = useYouTubePlayer({
    onEnded: () => nextTrackRef.current?.(),
    onError: (code) => {
      // Codes 100/101/150 = unavailable. Code 5 = HTML5 error.
      if ([100, 101, 150].includes(code)) {
        // Auto-advance after 1s
        setTimeout(() => nextTrackRef.current?.(), 1000)
      } else if (code === 5) {
        // Retry once, then advance
        setTimeout(() => {
          if (currentTrack) yt.loadVideo(currentTrack.videoId)
          else nextTrackRef.current?.()
        }, 2000)
      }
    },
  })

  // ── Favorites ──────────────────────────────────────────────────────────────
  const favs = useFavorites()

  // ── Playlists ──────────────────────────────────────────────────────────────
  const plists = usePlaylists()
  const [activePlaylistId, setActivePlaylistId]   = useState(null)
  const [pendingPlaylistTrack, setPendingPlaylistTrack] = useState(null)
  const [createPlaylistOpen, setCreatePlaylistOpen]     = useState(false)

  // ── Lyrics sync ────────────────────────────────────────────────────────────
  const { activeIndex: activeLyricIndex } = useLyricsSync(lyrics.lines, yt.currentTime)

  // ── Sync volume to player on ready ─────────────────────────────────────────
  useEffect(() => {
    if (!yt.playerReady) return
    yt.setVolume(isMuted ? 0 : volume)
  }, [yt.playerReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist volume ─────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('ml_volume', String(volume))
  }, [volume])

  // ── Load video when track changes ──────────────────────────────────────────
  useEffect(() => {
    if (!currentTrack || !yt.playerReady) return
    yt.loadVideo(currentTrack.videoId)
  }, [currentTrack?.videoId, yt.playerReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch lyrics when track changes ───────────────────────────────────────
  useEffect(() => {
    if (!currentTrack) return

    // 1. Try cached lyrics from favorites
    const fav = favs.favorites.find(f => f.videoId === currentTrack.videoId)
    if (fav?.syncedLyrics || fav?.plainLyrics) {
      const lines = fav.syncedLyrics ? parseLRC(fav.syncedLyrics) : []
      setLyrics({ syncedLyrics: fav.syncedLyrics || null, plainLyrics: fav.plainLyrics || null, lines })
      setLyricsError(null)
      return
    }

    // 2. Fetch from lrclib
    setLyricsLoading(true)
    setLyricsError(null)
    setLyrics({ syncedLyrics: null, plainLyrics: null, lines: [] })

    const { artist, track } = parseYouTubeTitle(currentTrack.title, currentTrack.channelTitle)

    getLyrics({ trackName: track, artistName: artist, duration: currentTrack.duration })
      .then(data => {
        if (data) {
          const lines = data.syncedLyrics ? parseLRC(data.syncedLyrics) : []
          setLyrics({ ...data, lines })
        } else {
          setLyricsError('not_found')
        }
      })
      .catch(() => setLyricsError('error'))
      .finally(() => setLyricsLoading(false))
  }, [currentTrack?.videoId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Queue actions ──────────────────────────────────────────────────────────
  const playTrack = useCallback((track) => {
    setQueue([track])
    setCurrentIndex(0)
  }, [])

  const addToQueue = useCallback((track) => {
    setQueue(prev => {
      if (prev.some(t => t.videoId === track.videoId)) return prev
      return [...prev, track]
    })
  }, [])

  const nextTrack = useCallback(() => {
    setCurrentIndex(prev => {
      if (repeatMode === 'one') {
        yt.seekTo(0)
        yt.play()
        return prev
      }
      if (isShuffled && queue.length > 1) {
        let r
        do { r = Math.floor(Math.random() * queue.length) } while (r === prev)
        return r
      }
      if (prev < queue.length - 1) return prev + 1
      if (repeatMode === 'all') return 0
      return prev
    })
  }, [repeatMode, isShuffled, queue.length, yt])

  // Keep ref fresh for onEnded callback
  useEffect(() => { nextTrackRef.current = nextTrack }, [nextTrack])

  const prevTrack = useCallback(() => {
    if (yt.currentTime > 3) { yt.seekTo(0); return }
    setCurrentIndex(prev => {
      if (prev > 0) return prev - 1
      if (repeatMode === 'all') return queue.length - 1
      return prev
    })
  }, [yt, repeatMode, queue.length])

  // ── Playback controls ──────────────────────────────────────────────────────
  const setVolume = useCallback((v) => {
    setVolumeState(v)
    yt.setVolume(v)
  }, [yt])

  const setMuted = useCallback((m) => {
    setIsMutedState(m)
    yt.setMuted(m)
  }, [yt])

  const setPlaybackRate = useCallback((rate) => {
    setPlaybackRateState(rate)
    yt.setPlaybackRate(rate)
  }, [yt])

  const cycleRepeatMode = useCallback(() => {
    setRepeatModeState(prev => REPEAT_MODES[(REPEAT_MODES.indexOf(prev) + 1) % REPEAT_MODES.length])
  }, [])

  const toggleShuffle = useCallback(() => setIsShuffled(s => !s), [])

  // ── Search ─────────────────────────────────────────────────────────────────
  const search = useCallback(async (query) => {
    if (!query.trim()) return
    setSearchLoading(true)
    setSearchError(null)
    setSidebarTab('search')
    try {
      setSearchResults(await searchSongs(query))
    } catch (e) {
      setSearchError(e.message)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // ── Toggle favorite with current lyrics ───────────────────────────────────
  const toggleFavoriteWithLyrics = useCallback((track) => {
    favs.toggleFavorite({
      ...track,
      syncedLyrics: lyrics.syncedLyrics,
      plainLyrics: lyrics.plainLyrics,
    })
  }, [favs, lyrics])

  // ── Playlist actions ──────────────────────────────────────────────────────
  const playPlaylist = useCallback((playlistId) => {
    const tracks = plists.getPlaylistTracks(playlistId)
    if (!tracks.length) return
    setQueue(tracks)
    setCurrentIndex(0)
  }, [plists])

  const openAddToPlaylist = useCallback((track) => {
    setPendingPlaylistTrack(track)
  }, [])

  const value = {
    // Track / queue
    currentTrack,
    queue,
    currentIndex,
    // Playback state (from YT)
    isPlaying: yt.isPlaying,
    currentTime: yt.currentTime,
    duration: yt.duration,
    playerReady: yt.playerReady,
    // Controls
    volume,
    isMuted,
    playbackRate,
    repeatMode,
    isShuffled,
    // Actions
    play: yt.play,
    pause: yt.pause,
    seekTo: yt.seekTo,
    setVolume,
    setMuted,
    setPlaybackRate,
    playTrack,
    addToQueue,
    nextTrack,
    prevTrack,
    cycleRepeatMode,
    toggleShuffle,
    // Lyrics
    lyrics,
    lyricsLoading,
    lyricsError,
    activeLyricIndex,
    // Search
    searchResults,
    searchLoading,
    searchError,
    search,
    // UI
    sidebarTab,
    setSidebarTab,
    lyricsMaximized,
    toggleLyricsMaximized,
    // Favorites (spread useFavorites + enhanced toggle)
    ...favs,
    toggleFavoriteWithLyrics,
    // Playlists
    playlists:              plists.playlists,
    playlistsLoading:       plists.playlistsLoading,
    getPlaylistTracks:      plists.getPlaylistTracks,
    createPlaylist:         plists.createPlaylist,
    renamePlaylist:         plists.renamePlaylist,
    deletePlaylist:         plists.deletePlaylist,
    addTrackToPlaylist:     plists.addTrackToPlaylist,
    removeTrackFromPlaylist: plists.removeTrackFromPlaylist,
    isTrackInPlaylist:      plists.isTrackInPlaylist,
    migratePlaylistsToCloud: plists.migratePlaylistsToCloud,
    activePlaylistId, setActivePlaylistId,
    pendingPlaylistTrack, setPendingPlaylistTrack,
    createPlaylistOpen, setCreatePlaylistOpen,
    playPlaylist,
    openAddToPlaylist,
    // YouTube container ref (consumed by VideoPlayer component)
    ytContainerRef: yt.containerRef,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return ctx
}

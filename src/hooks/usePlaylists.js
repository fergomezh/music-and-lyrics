import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchCloudPlaylists,
  fetchCloudPlaylistTracks,
  insertCloudPlaylist,
  updateCloudPlaylist,
  deleteCloudPlaylist,
  insertCloudPlaylistTrack,
  deleteCloudPlaylistTrack,
  batchInsertCloudPlaylistTracks,
} from './usePlaylistsCloud.js'

const PLAYLISTS_KEY = 'ml_playlists'
const TRACKS_KEY    = 'ml_playlist_tracks'

function loadPlaylists() {
  try { return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]') } catch { return [] }
}

function loadTracks() {
  try { return JSON.parse(localStorage.getItem(TRACKS_KEY) || '[]') } catch { return [] }
}

function savePlaylists(list) {
  try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

function saveTracks(list) {
  try { localStorage.setItem(TRACKS_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export function usePlaylists() {
  const { user } = useAuth()
  const [playlists, setPlaylists]         = useState(loadPlaylists)
  const [tracks, setTracks]               = useState(loadTracks)
  const [playlistsLoading, setLoading]    = useState(false)

  // ── Sync: load from cloud when user signs in ──────────────────────────────
  useEffect(() => {
    if (!user) {
      setPlaylists(loadPlaylists())
      setTracks(loadTracks())
      return
    }

    setLoading(true)
    Promise.all([
      fetchCloudPlaylists(user.id),
      // fetch all tracks across all playlists
      fetchCloudPlaylists(user.id).then(pls =>
        Promise.all(pls.map(pl => fetchCloudPlaylistTracks(user.id, pl.id)))
          .then(arrays => arrays.flat())
      ),
    ])
      .then(([pls, trks]) => {
        if (pls.length > 0) {
          setPlaylists(pls)
          setTracks(trks)
          savePlaylists(pls)
          saveTracks(trks)
        } else {
          // Cloud is empty — keep local data intact so migration can run
          setPlaylists(loadPlaylists())
          setTracks(loadTracks())
        }
      })
      .catch(() => {
        setPlaylists(loadPlaylists())
        setTracks(loadTracks())
      })
      .finally(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────

  const getPlaylistTracks = useCallback(
    (playlistId) =>
      tracks
        .filter(t => t.playlistId === playlistId)
        .sort((a, b) => a.position - b.position),
    [tracks]
  )

  const isTrackInPlaylist = useCallback(
    (playlistId, videoId) =>
      tracks.some(t => t.playlistId === playlistId && t.videoId === videoId),
    [tracks]
  )

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createPlaylist = useCallback((name) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const pl = { id, name, createdAt: now, updatedAt: now }

    setPlaylists(prev => {
      const next = [pl, ...prev]
      savePlaylists(next)
      return next
    })

    if (user) {
      insertCloudPlaylist(user.id, pl).catch(() => {})
    }

    return id
  }, [user])

  const renamePlaylist = useCallback((id, name) => {
    const updatedAt = new Date().toISOString()

    setPlaylists(prev => {
      const next = prev.map(pl => pl.id === id ? { ...pl, name, updatedAt } : pl)
      savePlaylists(next)
      return next
    })

    if (user) {
      updateCloudPlaylist(user.id, id, { name }).catch(() => {})
    }
  }, [user])

  const deletePlaylist = useCallback((id) => {
    setPlaylists(prev => {
      const next = prev.filter(pl => pl.id !== id)
      savePlaylists(next)
      return next
    })
    setTracks(prev => {
      const next = prev.filter(t => t.playlistId !== id)
      saveTracks(next)
      return next
    })

    if (user) {
      deleteCloudPlaylist(user.id, id).catch(() => {})
    }
  }, [user])

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    setTracks(prev => {
      if (prev.some(t => t.playlistId === playlistId && t.videoId === track.videoId)) {
        return prev
      }
      const maxPos = prev
        .filter(t => t.playlistId === playlistId)
        .reduce((m, t) => Math.max(m, t.position), -1)
      const entry = {
        playlistId,
        videoId:      track.videoId,
        position:     maxPos + 1,
        addedAt:      new Date().toISOString(),
        title:        track.title,
        channelTitle: track.channelTitle ?? '',
        thumbnailUrl: track.thumbnailUrl ?? '',
        duration:     track.duration     ?? null,
        syncedLyrics: track.syncedLyrics ?? null,
        plainLyrics:  track.plainLyrics  ?? null,
      }
      const next = [...prev, entry]
      saveTracks(next)

      if (user) {
        insertCloudPlaylistTrack(user.id, playlistId, track, maxPos + 1).catch(() => {})
      }

      return next
    })
  }, [user])

  const removeTrackFromPlaylist = useCallback((playlistId, videoId) => {
    setTracks(prev => {
      const next = prev.filter(t => !(t.playlistId === playlistId && t.videoId === videoId))
      saveTracks(next)
      return next
    })

    if (user) {
      deleteCloudPlaylistTrack(user.id, playlistId, videoId).catch(() => {})
    }
  }, [user])

  // ── Migration ─────────────────────────────────────────────────────────────

  const migratePlaylistsToCloud = useCallback(async () => {
    if (!user) return
    const localPls = loadPlaylists()
    const localTrks = loadTracks()
    if (!localPls.length) return

    for (const pl of localPls) {
      await insertCloudPlaylist(user.id, pl)
      const plTracks = localTrks.filter(t => t.playlistId === pl.id)
      if (plTracks.length) {
        await batchInsertCloudPlaylistTracks(user.id, pl.id, plTracks)
      }
    }

    // Re-fetch authoritative cloud state
    const pls = await fetchCloudPlaylists(user.id)
    const trks = (
      await Promise.all(pls.map(pl => fetchCloudPlaylistTracks(user.id, pl.id)))
    ).flat()

    setPlaylists(pls)
    setTracks(trks)
    savePlaylists(pls)
    saveTracks(trks)
  }, [user])

  return {
    playlists,
    playlistsLoading,
    getPlaylistTracks,
    isTrackInPlaylist,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    migratePlaylistsToCloud,
  }
}

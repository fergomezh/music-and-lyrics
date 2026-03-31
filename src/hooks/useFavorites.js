import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchCloudFavorites,
  insertCloudFavorite,
  deleteCloudFavorite,
  batchInsertCloudFavorites,
} from './useFavoritesCloud.js'

const STORAGE_KEY = 'ml_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function save(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(load)
  const [favoritesLoading, setFavoritesLoading] = useState(false)

  // ── Sync: load from cloud when user signs in, localStorage when signed out ──
  useEffect(() => {
    if (!user) {
      setFavorites(load())
      return
    }

    setFavoritesLoading(true)
    fetchCloudFavorites(user.id)
      .then(list => {
        setFavorites(list)
        save(list) // keep localStorage in sync for offline use
      })
      .catch(() => {
        // Network failure: fall back to whatever is in localStorage
        setFavorites(load())
      })
      .finally(() => setFavoritesLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations: optimistic local-first, cloud fire-and-forget ─────────────────

  const addFavorite = useCallback((track) => {
    setFavorites(prev => {
      if (prev.some(f => f.videoId === track.videoId)) return prev
      const next = [{ ...track, savedAt: new Date().toISOString() }, ...prev]
      save(next)
      return next
    })
    if (user) {
      insertCloudFavorite(user.id, { ...track, savedAt: new Date().toISOString() })
        .catch(() => { /* silently swallow — local state is already updated */ })
    }
  }, [user])

  const removeFavorite = useCallback((videoId) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.videoId !== videoId)
      save(next)
      return next
    })
    if (user) {
      deleteCloudFavorite(user.id, videoId)
        .catch(() => { /* silently swallow */ })
    }
  }, [user])

  const toggleFavorite = useCallback((track) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.videoId === track.videoId)
      const next = exists
        ? prev.filter(f => f.videoId !== track.videoId)
        : [{ ...track, savedAt: new Date().toISOString() }, ...prev]
      save(next)
      if (user) {
        if (exists) {
          deleteCloudFavorite(user.id, track.videoId).catch(() => {})
        } else {
          insertCloudFavorite(user.id, { ...track, savedAt: new Date().toISOString() }).catch(() => {})
        }
      }
      return next
    })
  }, [user])

  const isFavorite = useCallback(
    (videoId) => favorites.some(f => f.videoId === videoId),
    [favorites]
  )

  const exportFavorites = useCallback(() => {
    const blob = new Blob([JSON.stringify({ favorites }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'music-favorites.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [favorites])

  // ── Migration: push localStorage favorites up to the cloud ───────────────────

  const migrateLocalToCloud = useCallback(async () => {
    if (!user) return
    const local = load()
    if (!local.length) return
    await batchInsertCloudFavorites(user.id, local)
    // Re-fetch to get the authoritative cloud list
    const list = await fetchCloudFavorites(user.id)
    setFavorites(list)
    save(list)
  }, [user])

  return {
    favorites,
    favoritesLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    exportFavorites,
    migrateLocalToCloud,
  }
}

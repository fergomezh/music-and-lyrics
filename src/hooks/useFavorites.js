import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ml_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function save(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const addFavorite = useCallback((track) => {
    setFavorites(prev => {
      if (prev.some(f => f.videoId === track.videoId)) return prev
      const next = [{ ...track, savedAt: new Date().toISOString() }, ...prev]
      save(next)
      return next
    })
  }, [])

  const removeFavorite = useCallback((videoId) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.videoId !== videoId)
      save(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((track) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.videoId === track.videoId)
      const next = exists
        ? prev.filter(f => f.videoId !== track.videoId)
        : [{ ...track, savedAt: new Date().toISOString() }, ...prev]
      save(next)
      return next
    })
  }, [])

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

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, exportFavorites }
}

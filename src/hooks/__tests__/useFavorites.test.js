import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '../useFavorites.js'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const track = {
  videoId: 'abc123',
  title: 'Test Song',
  channelTitle: 'Test Artist',
  thumbnailUrl: 'https://example.com/thumb.jpg',
}

describe('useFavorites', () => {
  it('starts with empty favorites', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
  })

  it('adds a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(track))
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].videoId).toBe('abc123')
  })

  it('does not add duplicates', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => { result.current.addFavorite(track); result.current.addFavorite(track) })
    expect(result.current.favorites).toHaveLength(1)
  })

  it('removes a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(track))
    act(() => result.current.removeFavorite('abc123'))
    expect(result.current.favorites).toHaveLength(0)
  })

  it('toggleFavorite adds then removes', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggleFavorite(track))
    expect(result.current.isFavorite('abc123')).toBe(true)
    act(() => result.current.toggleFavorite(track))
    expect(result.current.isFavorite('abc123')).toBe(false)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.addFavorite(track))
    const stored = JSON.parse(localStorage.getItem('ml_favorites'))
    expect(stored[0].videoId).toBe('abc123')
  })

  it('loads from localStorage on mount', () => {
    localStorage.setItem('ml_favorites', JSON.stringify([{ ...track, savedAt: '2026-01-01T00:00:00Z' }]))
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toHaveLength(1)
  })
})

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLyricsSync } from '../useLyricsSync.js'

const lines = [
  { time: 5000, text: 'A' },
  { time: 10000, text: 'B' },
  { time: 15000, text: 'C' },
]

describe('useLyricsSync', () => {
  it('returns -1 before first line', () => {
    const { result } = renderHook(() => useLyricsSync(lines, 4))
    expect(result.current.activeIndex).toBe(-1)
  })

  it('returns correct index at exact match', () => {
    const { result } = renderHook(() => useLyricsSync(lines, 10))
    expect(result.current.activeIndex).toBe(1)
  })

  it('returns index of last passed line', () => {
    const { result } = renderHook(() => useLyricsSync(lines, 12))
    expect(result.current.activeIndex).toBe(1)
  })

  it('handles empty lines array', () => {
    const { result } = renderHook(() => useLyricsSync([], 10))
    expect(result.current.activeIndex).toBe(-1)
  })
})

import { describe, it, expect } from 'vitest'
import { parseLRC, findActiveLyricIndex } from '../lyricsParser.js'

describe('parseLRC', () => {
  it('parses standard LRC lines', () => {
    const lines = parseLRC('[00:12.00] Hello world\n[00:15.50] Second line')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toEqual({ time: 12000, text: 'Hello world' })
    expect(lines[1]).toEqual({ time: 15500, text: 'Second line' })
  })

  it('skips metadata tags', () => {
    const lines = parseLRC('[ti:Title]\n[ar:Artist]\n[00:05.00] Only line')
    expect(lines).toHaveLength(1)
    expect(lines[0].text).toBe('Only line')
  })

  it('handles timestamps without centiseconds', () => {
    const lines = parseLRC('[01:30] No centiseconds')
    expect(lines[0].time).toBe(90000)
  })

  it('handles multiple timestamps on one line', () => {
    const lines = parseLRC('[00:10.00][00:45.00] Chorus line')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toEqual({ time: 10000, text: 'Chorus line' })
    expect(lines[1]).toEqual({ time: 45000, text: 'Chorus line' })
  })

  it('stores empty lines as music note', () => {
    const lines = parseLRC('[00:05.00]')
    expect(lines[0].text).toBe('♪')
  })

  it('returns empty array for null/empty input', () => {
    expect(parseLRC(null)).toEqual([])
    expect(parseLRC('')).toEqual([])
  })

  it('sorts lines by time', () => {
    const lines = parseLRC('[00:20.00] Later\n[00:05.00] Earlier')
    expect(lines[0].time).toBe(5000)
    expect(lines[1].time).toBe(20000)
  })
})

describe('findActiveLyricIndex', () => {
  const lines = [
    { time: 5000, text: 'A' },
    { time: 10000, text: 'B' },
    { time: 15000, text: 'C' },
    { time: 20000, text: 'D' },
  ]

  it('returns -1 before first line', () => {
    expect(findActiveLyricIndex(lines, 4999)).toBe(-1)
  })

  it('returns index of exact match', () => {
    expect(findActiveLyricIndex(lines, 10000)).toBe(1)
  })

  it('returns last line whose time <= currentTimeMs', () => {
    expect(findActiveLyricIndex(lines, 12000)).toBe(1)
  })

  it('returns last index past end', () => {
    expect(findActiveLyricIndex(lines, 99000)).toBe(3)
  })

  it('returns -1 for empty array', () => {
    expect(findActiveLyricIndex([], 5000)).toBe(-1)
  })
})

import { describe, it, expect } from 'vitest'
import { formatTime, parseYouTubeTitle } from '../timeUtils.js'

describe('formatTime', () => {
  it('formats seconds to m:ss', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3600)).toBe('60:00')
    expect(formatTime(0)).toBe('0:00')
  })
  it('handles invalid input', () => {
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(null)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
  })
})

describe('parseYouTubeTitle', () => {
  it('splits on dash separator', () => {
    const r = parseYouTubeTitle('Queen - Bohemian Rhapsody (Official Video)', 'Queen Official')
    expect(r.artist).toBe('Queen')
    expect(r.track).toBe('Bohemian Rhapsody')
  })
  it('strips noise from track', () => {
    const r = parseYouTubeTitle('Eagles - Hotel California (Lyrics)', 'Eagles')
    expect(r.track).toBe('Hotel California')
  })
  it('falls back to channel title when no dash', () => {
    const r = parseYouTubeTitle('Bohemian Rhapsody', 'Queen VEVO')
    expect(r.artist).toBe('Queen')
    expect(r.track).toBe('Bohemian Rhapsody')
  })
})

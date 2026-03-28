import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Wraps the YouTube IFrame Player API.
 *
 * Initialization flow (two-stage, avoids race conditions):
 *   1. Load https://www.youtube.com/iframe_api script → sets apiReady=true
 *   2. When containerEl state is set AND apiReady=true → create YT.Player
 *
 * Uses a callback ref (not useRef) for the container so React state updates
 * trigger the initialization effect when the div mounts.
 *
 * Returns containerRef as a callback ref — pass it to a <div ref={containerRef} />.
 */
export function useYouTubePlayer({ onEnded, onError } = {}) {
  const playerRef = useRef(null)
  const pollingRef = useRef(null)
  const initializedRef = useRef(false)
  const callbacksRef = useRef({ onEnded, onError })

  const [containerEl, setContainerEl] = useState(null)
  const [apiReady, setApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Keep callbacks fresh without re-creating effects
  useEffect(() => { callbacksRef.current = { onEnded, onError } })

  // Callback ref: called by React when the container div mounts/unmounts
  const containerRef = useCallback((el) => setContainerEl(el), [])

  // Step 1: Load YouTube IFrame API script
  useEffect(() => {
    if (window.YT?.Player) { setApiReady(true); return }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); setApiReady(true) }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      document.head.appendChild(s)
    }
  }, [])

  // Step 2: Initialize player when both API and container are ready
  useEffect(() => {
    if (!apiReady || !containerEl || initializedRef.current) return
    initializedRef.current = true

    const startPolling = () => {
      if (pollingRef.current) return
      pollingRef.current = setInterval(() => {
        if (!playerRef.current?.getCurrentTime) return
        const t = playerRef.current.getCurrentTime()
        const d = playerRef.current.getDuration()
        setCurrentTime(t)
        if (d && isFinite(d)) setDuration(d)
      }, 500)
    }

    const stopPolling = () => {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    playerRef.current = new window.YT.Player(containerEl, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: () => setPlayerReady(true),
        onStateChange: ({ data }) => {
          const S = window.YT.PlayerState
          if (data === S.PLAYING) {
            setIsPlaying(true)
            startPolling()
          } else if (data === S.PAUSED) {
            setIsPlaying(false)
            stopPolling()
            if (playerRef.current?.getCurrentTime) {
              setCurrentTime(playerRef.current.getCurrentTime())
            }
          } else if (data === S.ENDED) {
            setIsPlaying(false)
            stopPolling()
            callbacksRef.current.onEnded?.()
          }
        },
        onError: ({ data }) => callbacksRef.current.onError?.(data),
      },
    })

    return () => stopPolling()
  }, [apiReady, containerEl])

  const loadVideo = useCallback((videoId) => {
    if (!playerRef.current) return
    setCurrentTime(0)
    playerRef.current.loadVideoById(videoId)
  }, [])

  const play = useCallback(() => playerRef.current?.playVideo(), [])
  const pause = useCallback(() => playerRef.current?.pauseVideo(), [])

  const seekTo = useCallback((seconds) => {
    if (!playerRef.current) return
    playerRef.current.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((vol) => playerRef.current?.setVolume(vol), [])
  const setMuted = useCallback((m) => {
    if (!playerRef.current) return
    m ? playerRef.current.mute() : playerRef.current.unMute()
  }, [])
  const setPlaybackRate = useCallback((rate) => playerRef.current?.setPlaybackRate(rate), [])

  return {
    containerRef,   // callback ref — attach to <div ref={containerRef} />
    playerReady,
    isPlaying,
    currentTime,
    duration,
    loadVideo,
    play,
    pause,
    seekTo,
    setVolume,
    setMuted,
    setPlaybackRate,
  }
}

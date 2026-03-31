import { useEffect, useState } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import { VideoPlayer } from './components/Player/VideoPlayer.jsx'
import { MainLayout } from './components/Layout/MainLayout.jsx'

/**
 * Root component.
 *
 * VideoPlayer is rendered as a sibling of MainLayout — NOT inside it.
 * This ensures the YouTube IFrame container div is always in the DOM,
 * even when the layout changes or panels are hidden.
 */
function AppBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const missingKey = !import.meta.env.VITE_YOUTUBE_API_KEY

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (missingKey) {
    return (
      <div className="banner banner--warning">
        YouTube API key not configured — add <code>VITE_YOUTUBE_API_KEY</code> to your <code>.env</code> file. See README for setup.
      </div>
    )
  }
  if (offline) {
    return (
      <div className="banner banner--offline">
        Offline — playing from favorites with cached lyrics
      </div>
    )
  }
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppBanner />
        <VideoPlayer />
        <MainLayout />
      </PlayerProvider>
    </AuthProvider>
  )
}
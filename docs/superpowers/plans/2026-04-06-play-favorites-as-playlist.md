# Play Favorites as Playlist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Play all" button to the Favorites panel that loads the visible (filtered) favorites into the player queue and starts playback.

**Architecture:** Extract a generic `playTracks(tracks[])` function from the existing `playPlaylist` logic in `PlayerContext.jsx`, expose it via context, then use it in `Favorites.jsx` to render a Play button that operates on the currently shown (filtered) list.

**Tech Stack:** React, Vitest, @testing-library/react

---

## File Map

| File | Change |
|---|---|
| `src/context/PlayerContext.jsx` | Add `playTracks` callback, refactor `playPlaylist` to use it, expose `playTracks` in context value |
| `src/components/Library/Favorites.jsx` | Consume `playTracks` from context, add Play button in filter row |

No new files. No CSS changes (reuse existing `.favorites__export` button style).

---

### Task 1: Add `playTracks` to PlayerContext

**Files:**
- Modify: `src/context/PlayerContext.jsx`

- [ ] **Step 1: Add `playTracks` callback**

In `PlayerContext.jsx`, find the `playPlaylist` callback (around line 226) and add `playTracks` immediately above it:

```js
const playTracks = useCallback((tracks) => {
  if (!tracks.length) return
  setQueue(tracks)
  setCurrentIndex(0)
}, [])

const playPlaylist = useCallback((playlistId) => {
  playTracks(plists.getPlaylistTracks(playlistId))
}, [plists, playTracks])
```

- [ ] **Step 2: Expose `playTracks` in context value**

In the `value` object (around line 237), add `playTracks` next to `playPlaylist`:

```js
playPlaylist,
playTracks,
```

- [ ] **Step 3: Verify the app still runs**

Run: `npm run dev`
Expected: app loads, existing playlists still play normally when clicking their Play button.

- [ ] **Step 4: Commit**

```bash
git add src/context/PlayerContext.jsx
git commit -m "feat: extract playTracks from playPlaylist in PlayerContext"
```

---

### Task 2: Add Play button to Favorites panel

**Files:**
- Modify: `src/components/Library/Favorites.jsx`

- [ ] **Step 1: Import Play icon and consume `playTracks`**

At the top of `Favorites.jsx`, update the imports and hook usage:

```jsx
import { useState } from 'react'
import { Download, Play } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { TrackItem } from './TrackItem.jsx'

export function Favorites() {
  const { favorites, exportFavorites, playTracks } = usePlayer()
  const [filter, setFilter] = useState('')
```

- [ ] **Step 2: Add the Play button in the filter row**

Replace the `favorites__filter` div content so the Play button appears before the Export button:

```jsx
<div className="favorites__filter">
  <input
    type="text"
    placeholder="Filter favorites…"
    value={filter}
    onChange={e => setFilter(e.target.value)}
  />
  {shown.length > 0 && (
    <button
      className="favorites__export"
      onClick={() => playTracks(shown)}
      title="Play all"
    >
      <Play size={13} fill="currentColor" />
    </button>
  )}
  {favorites.length > 0 && (
    <button
      className="favorites__export"
      onClick={exportFavorites}
      title="Export as JSON"
    >
      <Download size={13} />
    </button>
  )}
</div>
```

- [ ] **Step 3: Manually verify behavior**

Run: `npm run dev`

Check these scenarios:
1. No favorites → Play button not visible.
2. Favorites present, no filter → Play button visible; clicking it loads all favorites into queue and starts playing the first one.
3. Favorites present, filter active (e.g. type an artist name) → Play button visible; clicking it plays only the filtered results.
4. Filter returns no matches → Play button not visible.

- [ ] **Step 4: Commit**

```bash
git add src/components/Library/Favorites.jsx
git commit -m "feat: add play-all button to favorites panel"
```

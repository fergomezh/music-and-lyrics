# Play Favorites as Playlist — Design Spec

**Date:** 2026-04-06

## Overview

Add a "Play all" button to the Favorites panel that loads the currently visible (filtered) favorites into the player queue and starts playback from the first track.

## Architecture

### PlayerContext — `playTracks(tracks[])`

Extract the shared queue-loading logic into a generic base function:

```js
const playTracks = useCallback((tracks) => {
  if (!tracks.length) return
  setQueue(tracks)
  setCurrentIndex(0)
}, [])
```

`playPlaylist` becomes a thin wrapper over `playTracks`:

```js
const playPlaylist = useCallback((playlistId) => {
  playTracks(plists.getPlaylistTracks(playlistId))
}, [plists, playTracks])
```

`playTracks` is exposed in the context `value`.

### Favorites.jsx — "Play all" button

A `<Play>` icon button is added to the filter row header, to the left of the existing Export button. It is only rendered when `shown.length > 0`.

Clicking it calls `playTracks(shown)`:
- If a filter is active → plays only the filtered results.
- If no filter → plays all favorites.

Button order in header: **[Play] [Export]**

## Behavior

| State | Button visible? | What plays |
|---|---|---|
| No favorites | No | — |
| Favorites, no filter | Yes | All favorites |
| Favorites, filter active | Yes | Only filtered results |

## Files Changed

| File | Change |
|---|---|
| `src/context/PlayerContext.jsx` | Add `playTracks`, refactor `playPlaylist` to use it, expose `playTracks` in context value |
| `src/components/Library/Favorites.jsx` | Consume `playTracks`, add Play button in header |

## Out of Scope

- No changes to shuffle/repeat behavior (those apply after the queue is loaded as they do today).
- No CSS additions beyond reusing existing `.favorites__export` button styles.

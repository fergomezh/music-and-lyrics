import { supabase } from '../lib/supabaseClient.js'

// ── Column mapping helpers ────────────────────────────────────────────────────

function playlistToRow(userId, pl) {
  return {
    user_id:    userId,
    id:         pl.id,
    name:       pl.name,
    created_at: pl.createdAt ?? new Date().toISOString(),
    updated_at: pl.updatedAt ?? new Date().toISOString(),
  }
}

function playlistFromRow(row) {
  return {
    id:        row.id,
    name:      row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function trackToRow(userId, playlistId, track, position) {
  return {
    user_id:       userId,
    playlist_id:   playlistId,
    video_id:      track.videoId,
    position:      position,
    added_at:      track.addedAt ?? new Date().toISOString(),
    title:         track.title,
    channel_title: track.channelTitle ?? null,
    thumbnail_url: track.thumbnailUrl ?? null,
    duration:      track.duration     ?? null,
    synced_lyrics: track.syncedLyrics ?? null,
    plain_lyrics:  track.plainLyrics  ?? null,
  }
}

function trackFromRow(row) {
  return {
    playlistId:   row.playlist_id,
    videoId:      row.video_id,
    position:     row.position,
    addedAt:      row.added_at,
    title:        row.title,
    channelTitle: row.channel_title ?? '',
    thumbnailUrl: row.thumbnail_url ?? '',
    duration:     row.duration      ?? null,
    syncedLyrics: row.synced_lyrics ?? null,
    plainLyrics:  row.plain_lyrics  ?? null,
  }
}

// ── Playlist CRUD ─────────────────────────────────────────────────────────────

export async function fetchCloudPlaylists(userId) {
  const { data, error } = await supabase
    .from('user_playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(playlistFromRow)
}

export async function fetchCloudPlaylistTracks(userId, playlistId) {
  const { data, error } = await supabase
    .from('user_playlist_tracks')
    .select('*')
    .eq('user_id', userId)
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })

  if (error) throw error
  return (data ?? []).map(trackFromRow)
}

export async function insertCloudPlaylist(userId, pl) {
  const { error } = await supabase
    .from('user_playlists')
    .insert(playlistToRow(userId, pl))

  if (error && error.code !== '23505') throw error
}

export async function updateCloudPlaylist(userId, id, fields) {
  const { error } = await supabase
    .from('user_playlists')
    .update({ name: fields.name, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)

  if (error) throw error
}

export async function deleteCloudPlaylist(userId, id) {
  const { error } = await supabase
    .from('user_playlists')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)

  if (error) throw error
}

// ── Playlist track CRUD ───────────────────────────────────────────────────────

export async function insertCloudPlaylistTrack(userId, playlistId, track, position) {
  const { error } = await supabase
    .from('user_playlist_tracks')
    .insert(trackToRow(userId, playlistId, track, position))

  if (error && error.code !== '23505') throw error
}

export async function deleteCloudPlaylistTrack(userId, playlistId, videoId) {
  const { error } = await supabase
    .from('user_playlist_tracks')
    .delete()
    .eq('user_id', userId)
    .eq('playlist_id', playlistId)
    .eq('video_id', videoId)

  if (error) throw error
}

export async function batchInsertCloudPlaylistTracks(userId, playlistId, tracks) {
  if (!tracks.length) return
  const rows = tracks.map((t, i) => trackToRow(userId, playlistId, t, i))

  const { error } = await supabase
    .from('user_playlist_tracks')
    .upsert(rows, { onConflict: 'playlist_id,video_id' })

  if (error) throw error
}

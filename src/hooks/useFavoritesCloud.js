import { supabase } from '../lib/supabaseClient.js'

// ── Column mapping helpers ────────────────────────────────────────────────────

function toRow(userId, track) {
  return {
    user_id:       userId,
    video_id:      track.videoId,
    title:         track.title,
    channel_title: track.channelTitle ?? null,
    thumbnail_url: track.thumbnailUrl ?? null,
    synced_lyrics: track.syncedLyrics ?? null,
    plain_lyrics:  track.plainLyrics  ?? null,
    saved_at:      track.savedAt      ?? new Date().toISOString(),
  }
}

function fromRow(row) {
  return {
    videoId:      row.video_id,
    title:        row.title,
    channelTitle: row.channel_title ?? '',
    thumbnailUrl: row.thumbnail_url ?? '',
    syncedLyrics: row.synced_lyrics ?? null,
    plainLyrics:  row.plain_lyrics  ?? null,
    savedAt:      row.saved_at,
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function fetchCloudFavorites(userId) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(fromRow)
}

export async function insertCloudFavorite(userId, track) {
  const { error } = await supabase
    .from('user_favorites')
    .insert(toRow(userId, track))

  // Unique constraint violation = already saved — treat as success
  if (error && error.code !== '23505') throw error
}

export async function deleteCloudFavorite(userId, videoId) {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId)

  if (error) throw error
}

export async function batchInsertCloudFavorites(userId, tracks) {
  if (!tracks.length) return
  const rows = tracks.map(t => toRow(userId, t))

  const { error } = await supabase
    .from('user_favorites')
    .upsert(rows, { onConflict: 'user_id,video_id', ignoreDuplicates: true })

  if (error) throw error
}

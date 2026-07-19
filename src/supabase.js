import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

// Thin fetch wrappers over Supabase REST + Storage — no SDK dependency needed.

const headers = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
})

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
export function shortCode(len = 8) {
  const arr = crypto.getRandomValues(new Uint8Array(len))
  return [...arr].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Upload a data-URL asset to the public "photos" bucket; returns its public URL.
export async function uploadAsset(dataUrl, path, contentType) {
  const blob = await (await fetch(dataUrl)).blob()
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${path}`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': contentType },
    body: blob,
  })
  if (!res.ok) throw new Error(`upload failed: ${res.status}`)
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${path}`
}

export async function saveWish(wish) {
  const code = shortCode()
  const token = shortCode(24) // secret; kept only on the creator's device
  const payload = { ...wish }
  if (payload.photos?.length) {
    payload.photos = await Promise.all(
      payload.photos.map((p, i) =>
        p.startsWith('data:') ? uploadAsset(p, `${code}-${i}.jpg`, 'image/jpeg') : p
      )
    )
  }
  if (payload.voice?.startsWith('data:')) {
    payload.voice = await uploadAsset(payload.voice, `${code}-voice.webm`, 'audio/webm')
  }
  // Tag where this wish was created (localhost = dev, smileheart.in = prod)
  // so requests can be told apart in the DB. Harmless metadata; viewer ignores it.
  payload._host = window.location.hostname
  payload._createdAt = new Date().toISOString()
  const delete_hash = await sha256Hex(token)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wishes`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ short_code: code, payload, delete_hash }),
  })
  if (!res.ok) throw new Error(`save failed: ${res.status}`)
  return { code, token }
}

// Permanently delete a wish — only works with the secret token the creator
// stored on their device. Returns true if a row was actually removed.
export async function deleteWish(code, token) {
  if (!token) return false
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_wish`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_code: code, p_token: token }),
  })
  if (!res.ok) throw new Error(`delete failed: ${res.status}`)
  return res.json()
}

export async function loadWish(code) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wishes?short_code=eq.${encodeURIComponent(code)}&select=payload`,
    { headers: headers() }
  )
  if (!res.ok) throw new Error(`load failed: ${res.status}`)
  const rows = await res.json()
  if (!rows.length) return null
  // fire-and-forget open counter
  fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_views`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).catch(() => {})
  return rows[0].payload
}

// Recipient reactions ("send a hug back").
export async function sendReaction(code, emoji, message) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reactions`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ wish_code: code, emoji, message: message || null }),
  })
  if (!res.ok) throw new Error(`reaction failed: ${res.status}`)
}

// Stats for the "My Wishes" dashboard.
export async function fetchStats(codes) {
  if (!codes.length) return { wishes: [], reactions: [] }
  const list = codes.map(encodeURIComponent).join(',')
  const [wRes, rRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/wishes?short_code=in.(${list})&select=short_code,view_count,created_at`, { headers: headers() }),
    fetch(`${SUPABASE_URL}/rest/v1/reactions?wish_code=in.(${list})&select=wish_code,emoji,message,created_at&order=created_at.desc`, { headers: headers() }),
  ])
  return {
    wishes: wRes.ok ? await wRes.json() : [],
    reactions: rRes.ok ? await rRes.json() : [],
  }
}

// Pre-launch "Coming Soon" emoji reactions.
export const LAUNCH_EMOJIS = ['😍', '❤️', '🎉', '🥳', '🔥']

export async function addLaunchReaction(emoji) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_launch_reaction`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_emoji: emoji }),
  })
  if (!res.ok) throw new Error(`launch reaction failed: ${res.status}`)
}

// Exact count per emoji via one HEAD request each (Content-Range total).
export async function fetchLaunchReactionCounts() {
  const out = {}
  await Promise.all(
    LAUNCH_EMOJIS.map(async (em) => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/launch_reactions?select=id&emoji=eq.${encodeURIComponent(em)}`,
          { method: 'HEAD', headers: { ...headers(), Prefer: 'count=exact', Range: '0-0' } }
        )
        const cr = res.headers.get('content-range') || '*/0'
        out[em] = parseInt(cr.split('/')[1], 10) || 0
      } catch { out[em] = 0 }
    })
  )
  return out
}

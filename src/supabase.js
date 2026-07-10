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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wishes`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ short_code: code, payload }),
  })
  if (!res.ok) throw new Error(`save failed: ${res.status}`)
  return code
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

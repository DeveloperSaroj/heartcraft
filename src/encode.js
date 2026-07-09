// Wish data is stored entirely in the URL hash so viewer links need no backend.
export function encodeWish(wish) {
  const json = JSON.stringify(wish)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeWish(str) {
  try {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch {
    return null
  }
}

export function viewerUrl(wish) {
  const base = window.location.origin + window.location.pathname
  return `${base}#/view/${encodeWish(wish)}`
}

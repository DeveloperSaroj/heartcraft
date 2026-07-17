import React, { useEffect, useState } from 'react'
import Wizard from './Wizard.jsx'
import Viewer from './Viewer.jsx'
import MyWishes from './MyWishes.jsx'
import { PrivacyPolicy, TermsOfUse } from './Legal.jsx'
import { decodeWish } from './encode.js'
import { loadWish } from './supabase.js'
import { trackEvent } from './analytics.js'

// Hash routing:
//   #/w/<code>     — short link, wish stored in the database
//   #/view/<data>  — legacy/fallback, wish encoded in the URL itself
//   #/mine         — creator dashboard
//   #/privacy, #/terms — legal pages
// Anything else opens the creator wizard.
function parseHash() {
  if (window.location.hash === '#/mine') return { type: 'mine' }
  if (window.location.hash === '#/privacy') return { type: 'privacy' }
  if (window.location.hash === '#/terms') return { type: 'terms' }
  const short = window.location.hash.match(/^#\/w\/([A-Za-z0-9]+)$/)
  if (short) return { type: 'short', code: short[1] }
  const inline = window.location.hash.match(/^#\/view\/(.+)$/)
  if (inline) return { type: 'inline', wish: decodeWish(inline[1]) }
  return null
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [remoteWish, setRemoteWish] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error

  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); setRemoteWish(null); setStatus('idle') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route?.type !== 'short') return
    let cancelled = false
    setStatus('loading')
    loadWish(route.code)
      .then((w) => {
        if (cancelled) return
        setRemoteWish(w)
        setStatus(w ? 'idle' : 'error')
        if (w) trackEvent('opened', { occasion: w.occasion, wishCode: route.code })
      })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [route])

  if (route?.type === 'mine') return <MyWishes />
  if (route?.type === 'privacy') return <PrivacyPolicy />
  if (route?.type === 'terms') return <TermsOfUse />
  if (route?.type === 'short') {
    if (status === 'loading') {
      return <div className="app-status"><span className="brand-heart big">💗</span><p>Opening your surprise...</p></div>
    }
    if (status === 'error' || !remoteWish) {
      return <div className="app-status"><p>😔 This wish link doesn’t exist or has expired.</p></div>
    }
    return <Viewer wish={remoteWish} code={route.code} />
  }
  if (route?.type === 'inline' && route.wish) return <Viewer wish={route.wish} />
  return <Wizard />
}

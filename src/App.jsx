import React, { useEffect, useState } from 'react'
import Wizard from './Wizard.jsx'
import Viewer from './Viewer.jsx'
import MyWishes from './MyWishes.jsx'
import Splash from './Splash.jsx'
import ComingSoon, { LAUNCH_TS } from './ComingSoon.jsx'
import { PrivacyPolicy, TermsOfUse } from './Legal.jsx'
import { decodeWish } from './encode.js'
import { loadWish } from './supabase.js'
import { trackEvent } from './analytics.js'

// Pre-launch gate: on the real site (not localhost) the whole app shows
// "Coming Soon" until launch — so no wishes can be created before 20 July.
// localhost is never gated (so videos/demos can be made locally), and
// `#/app` on prod sets a bypass for final pre-launch testing.
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
function launchGateActive() {
  if (window.location.hash === '#/soon') return true // manual preview of the teaser
  if (IS_LOCAL) return false
  if (Date.now() >= LAUNCH_TS) return false
  try {
    if (window.location.hash === '#/app') { sessionStorage.setItem('sh-bypass', '1') }
    if (sessionStorage.getItem('sh-bypass')) return false
  } catch { /* ignore */ }
  return true
}

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

  // Intro splash: only on the creator page, and only the first load of a
  // browser session (so navigating back from preview/legal doesn't replay it).
  const [showSplash, setShowSplash] = useState(() => {
    if (parseHash() !== null) return false // deep-links (viewer, etc.) skip it
    try {
      if (sessionStorage.getItem('sh-splash-seen')) return false
      sessionStorage.setItem('sh-splash-seen', '1')
    } catch { /* storage blocked — just show it */ }
    return true
  })

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

  // Privacy/Terms stay reachable (footer links); everything else → Coming Soon.
  if (launchGateActive()) {
    if (route?.type === 'privacy') return <PrivacyPolicy />
    if (route?.type === 'terms') return <TermsOfUse />
    return <ComingSoon />
  }

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
  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <Wizard />
    </>
  )
}

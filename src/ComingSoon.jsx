import React, { useEffect, useMemo, useState } from 'react'
import { LAUNCH_EMOJIS, addLaunchReaction, fetchLaunchReactionCounts } from './supabase.js'
import { supabaseEnabled } from './config.js'

// Launch target: 20 July 2026, 00:00 IST (+05:30).
export const LAUNCH_TS = Date.parse('2026-07-20T00:00:00+05:30')

// Screenshots for the teaser gallery — files live in public/previews/.
const PREVIEWS = [
  { src: 'previews/p2.jpg', label: 'Pick any occasion' },
  { src: 'previews/p3.jpg', label: 'Blow out the candles' },
  { src: 'previews/p1.jpg', label: 'Your photos on a clothesline' },
  { src: 'previews/p4.jpg', label: 'A hand-sealed letter' },
]

const FEATURES = [
  { emoji: '🎂', text: '12 occasions — birthday, anniversary, apology, propose, miss you & more' },
  { emoji: '✨', text: 'Cinematic animated experiences, not a boring card' },
  { emoji: '🔗', text: 'Create in minutes, share with one link' },
  { emoji: '💌', text: 'Photos, voice notes & a hand-sealed letter' },
  { emoji: '🎁', text: 'Interactive surprises they’ll never forget' },
]

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  return [
    { v: Math.floor(s / 86400), l: 'days' },
    { v: Math.floor((s % 86400) / 3600), l: 'hours' },
    { v: Math.floor((s % 3600) / 60), l: 'mins' },
    { v: s % 60, l: 'secs' },
  ]
}

function FloatingHearts() {
  const hearts = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 8,
      dur: 7 + Math.random() * 8, size: 0.8 + Math.random() * 1.6,
      glyph: ['💗', '💖', '💕', '✨', '🎉'][i % 5],
    })), []
  )
  return (
    <div className="cs-hearts" aria-hidden>
      {hearts.map((h) => (
        <span key={h.id} className="cs-heart" style={{
          left: `${h.left}%`, fontSize: `${h.size}rem`,
          animationDelay: `${h.delay}s`, animationDuration: `${h.dur}s`,
        }}>{h.glyph}</span>
      ))}
    </div>
  )
}

function EmojiReactions() {
  const [counts, setCounts] = useState({})
  const [picked, setPicked] = useState(() => {
    try { return localStorage.getItem('sh-launch-reacted') || '' } catch { return '' }
  })

  useEffect(() => {
    if (!supabaseEnabled()) return
    fetchLaunchReactionCounts().then(setCounts).catch(() => {})
  }, [])

  const react = async (em) => {
    if (picked) return
    setPicked(em)
    setCounts((c) => ({ ...c, [em]: (c[em] || 0) + 1 }))
    try { localStorage.setItem('sh-launch-reacted', em) } catch { /* ignore */ }
    try { await addLaunchReaction(em) } catch { /* best effort */ }
  }

  return (
    <div className="cs-react">
      <p className="cs-react-title">{picked ? 'Thanks for the love! 💗' : 'Excited? Tap how you feel 👇'}</p>
      <div className="cs-react-row">
        {LAUNCH_EMOJIS.map((em) => (
          <button
            key={em}
            className={`cs-emoji ${picked === em ? 'picked' : ''}`}
            onClick={() => react(em)}
            disabled={!!picked}
          >
            <span className="cs-emoji-glyph">{em}</span>
            {counts[em] > 0 && <span className="cs-emoji-count">{counts[em]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ComingSoon() {
  const parts = useCountdown(LAUNCH_TS)
  return (
    <div className="coming-soon">
      <FloatingHearts />
      <div className="cs-inner">
        <div className="cs-medallion">
          <span className="cs-ring" />
          <img src="symbol.png" alt="SmileHeart" />
        </div>
        <h1 className="cs-title">SmileHeart</h1>
        <p className="cs-tagline">Crafting beautiful wishes, delivering smiles</p>

        <div className="cs-badge">🚀 Launching 20 July</div>

        <div className="cs-countdown">
          {parts.map((p) => (
            <div className="cs-cell" key={p.l}>
              <span className="cs-num">{String(p.v).padStart(2, '0')}</span>
              <span className="cs-lbl">{p.l}</span>
            </div>
          ))}
        </div>

        <p className="cs-about">
          Turn any birthday, anniversary, apology, proposal or “miss you” into an
          <b> unforgettable animated surprise</b> — crafted by you, delivered with one link.
        </p>

        <div className="cs-features">
          {FEATURES.map((f, i) => (
            <div className="cs-feature" key={i}><span>{f.emoji}</span><p>{f.text}</p></div>
          ))}
        </div>

        <div className="cs-gallery">
          {PREVIEWS.map((p, i) => (
            <figure className="cs-shot" key={i} style={{ '--tilt': `${(i % 2 ? 1 : -1) * 2}deg` }}>
              <img src={p.src} alt={p.label} loading="lazy" onError={(e) => { e.target.closest('.cs-shot').style.display = 'none' }} />
              <figcaption>{p.label}</figcaption>
            </figure>
          ))}
        </div>

        <EmojiReactions />

        <footer className="cs-footer">
          <p>Questions? WhatsApp <a href="https://wa.me/918018034448">+91 80180 34448</a> · <a href="mailto:sarojbarik626@gmail.com">email us</a></p>
          <p className="cs-legal"><a href="#/privacy">Privacy</a> · <a href="#/terms">Terms</a></p>
        </footer>
      </div>
    </div>
  )
}

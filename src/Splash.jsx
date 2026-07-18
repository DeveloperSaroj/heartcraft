import React, { useEffect, useMemo, useState } from 'react'

// World-class intro: brand-gradient stage, logo medallion springs in with a
// glow ring, hearts + sparkles float up, wordmark and tagline rise, then the
// whole thing lifts away to reveal the app. Shows once per browser session.
export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 2600)
    const finish = setTimeout(onDone, 3400) // after the lift-away transition
    return () => { clearTimeout(hold); clearTimeout(finish) }
  }, [onDone])

  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 8 + Math.random() * 84,
        delay: 0.4 + Math.random() * 1.6,
        dur: 2.6 + Math.random() * 2.2,
        size: 0.8 + Math.random() * 1.6,
        glyph: ['💗', '💖', '💕', '💝', '✨'][i % 5],
      })),
    []
  )
  const sparks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 1.4 + Math.random() * 1.8,
        size: 2 + Math.random() * 3,
      })),
    []
  )

  return (
    <div className={`splash ${leaving ? 'splash-leaving' : ''}`} aria-hidden>
      <div className="splash-glow" />

      {sparks.map((s) => (
        <span
          key={s.id}
          className="splash-spark"
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }}
        />
      ))}

      {hearts.map((h) => (
        <span
          key={h.id}
          className="splash-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}rem`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
          }}
        >
          {h.glyph}
        </span>
      ))}

      <div className="splash-center">
        <div className="splash-medallion">
          <span className="splash-ring" />
          <img src="symbol.png" alt="SmileHeart" />
        </div>
        <h1 className="splash-title">SmileHeart</h1>
        <p className="splash-tagline">Crafting beautiful wishes, delivering smiles</p>
      </div>
    </div>
  )
}

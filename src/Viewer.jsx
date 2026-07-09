import React, { useEffect, useMemo, useState } from 'react'
import { CAKES, VIBES, OCCASION_COPY, byId } from './options.js'
import Cake from './Cake.jsx'
import { startMusic, stopMusic } from './music.js'

// Scene sequence: gate → intro → headline → cake → (photo) → letter → finale.
// The gate requires a tap, which also unlocks browser audio for the music.
const DURATIONS = { intro: 4200, headline: 3800, cake: 5200, photo: 4500 }

function Particles({ kind, accent }) {
  const items = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 8,
        size: 0.7 + Math.random() * 1.4,
      })),
    []
  )
  const glyph = kind === 'hearts' ? '💗' : kind === 'balloons' ? '🎈' : '✨'
  return (
    <div className="particles" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            fontSize: `${p.size}rem`,
            color: accent,
          }}
        >
          {glyph}
        </span>
      ))}
    </div>
  )
}

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 3 + Math.random() * 4,
        hue: Math.floor(Math.random() * 360),
        rot: Math.random() * 360,
      })),
    []
  )
  return (
    <div className="particles" aria-hidden>
      {bits.map((b) => (
        <i
          key={b.id}
          className="confetti-bit"
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            background: `hsl(${b.hue}, 90%, 60%)`,
            transform: `rotate(${b.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function Typewriter({ text, speed = 35 }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= text.length) return
    const t = setTimeout(() => setN(n + 1), speed)
    return () => clearTimeout(t)
  }, [n, text, speed])
  return <p className="letter-text">{text.slice(0, n)}<span className="caret">|</span></p>
}

// Runaway "No" button + Yes celebration for proposals.
function ProposeEnding({ name }) {
  const [noPos, setNoPos] = useState(null)
  const [saidYes, setSaidYes] = useState(false)
  const dodge = (e) => {
    e.stopPropagation()
    setNoPos({ x: Math.random() * 70 + 5, y: Math.random() * 60 + 15 })
  }
  if (saidYes) {
    return (
      <div className="scene">
        <h1 className="headline pop">YESSS!!! 💍💖</h1>
        <p className="line fade-late">Happiest day ever — congratulations, {name}! 🥂</p>
      </div>
    )
  }
  return (
    <div className="scene" onClick={(e) => e.stopPropagation()}>
      <h1 className="headline pop">Will you say yes? 💍</h1>
      <div className="yesno-row">
        <button className="btn primary yes-btn" onClick={() => setSaidYes(true)}>Yes! 💖</button>
        <button
          className="btn ghost no-btn"
          style={noPos ? { position: 'fixed', left: `${noPos.x}%`, top: `${noPos.y}%` } : {}}
          onMouseEnter={dodge}
          onClick={dodge}
          onTouchStart={dodge}
        >
          No 🙈
        </button>
      </div>
    </div>
  )
}

export default function Viewer({ wish }) {
  const scenes = useMemo(() => {
    const s = ['gate', 'intro', 'headline', 'cake']
    if (wish.photo) s.push('photo')
    s.push('letter', 'finale')
    return s
  }, [wish.photo])

  const [i, setI] = useState(0)
  const scene = scenes[i]
  const copy = OCCASION_COPY[wish.occasion] || OCCASION_COPY.birthday
  const cake = byId(CAKES, wish.cake)
  const vibe = byId(VIBES, wish.vibe)
  const name = wish.name || 'You'

  useEffect(() => {
    const d = DURATIONS[scene]
    if (!d) return
    const t = setTimeout(() => setI((x) => Math.min(x + 1, scenes.length - 1)), d)
    return () => clearTimeout(t)
  }, [scene, scenes.length])

  useEffect(() => () => stopMusic(), [])

  const next = () => setI((x) => Math.min(x + 1, scenes.length - 1))
  const open = (e) => {
    e.stopPropagation()
    startMusic(wish.occasion)
    next()
  }

  const style = {
    '--v-bg1': vibe.theme.bg1,
    '--v-bg2': vibe.theme.bg2,
    '--v-accent': vibe.theme.accent,
  }

  return (
    <div className="viewer" style={style} onClick={scene === 'gate' ? undefined : next}>
      {scene === 'finale' ? <Confetti /> : scene !== 'gate' && (
        <Particles kind={wish.occasion === 'birthday' ? 'balloons' : 'hearts'} accent={vibe.theme.accent} />
      )}

      {scene === 'gate' && (
        <div className="scene">
          <div className="gift pop" onClick={open}>🎁</div>
          <h1 className="line">A surprise for {name}</h1>
          <button className="btn primary continue-btn" onClick={open}>Tap to open 🔓</button>
          <p className="gate-hint">🔊 turn your sound on</p>
        </div>
      )}

      {scene === 'intro' && (
        <div className="scene">
          <h1 className="line pop">{copy.intro(name)}</h1>
          <p className="line fade-late">{copy.intro2}</p>
        </div>
      )}

      {scene === 'headline' && (
        <div className="scene">
          <h1 className="headline pop">{copy.headline(name)}</h1>
          {wish.month && wish.day && (
            <p className="line fade-late">{wish.month} {wish.day} — a day worth celebrating 🗓️</p>
          )}
        </div>
      )}

      {scene === 'cake' && (
        <div className="scene">
          <div className="cake-float"><Cake colors={cake.colors} /></div>
          <p className="line fade-late">{copy.cakeLine}</p>
        </div>
      )}

      {scene === 'photo' && (
        <div className="scene">
          <div className="photo-frame pop">
            <img src={wish.photo} alt={name} />
          </div>
          <p className="line fade-late">A moment worth keeping 📸</p>
        </div>
      )}

      {scene === 'letter' && (
        <div className="scene" onClick={(e) => e.stopPropagation()}>
          <div className="letter-card pop">
            <div className="letter-head">💌 A letter for you</div>
            <Typewriter text={wish.letter || '...'} />
          </div>
          <button className="btn primary continue-btn" onClick={next}>Continue →</button>
        </div>
      )}

      {scene === 'finale' && (
        wish.occasion === 'propose' ? (
          <ProposeEnding name={name} />
        ) : (
          <div className="scene">
            <h1 className="headline pop">{copy.finale}</h1>
            <p className="line fade-late">Made with 💗 on HeartCraft</p>
          </div>
        )
      )}

      {!['gate', 'letter', 'finale'].includes(scene) && <div className="tap-hint">tap to skip</div>}
    </div>
  )
}

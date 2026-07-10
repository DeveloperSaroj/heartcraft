import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CAKES, VIBES, OCCASION_COPY, BOX_MESSAGES, byId } from './options.js'
import Cake from './Cake.jsx'
import { startMusic, stopMusic } from './music.js'
import { sendReaction } from './supabase.js'
import { supabaseEnabled } from './config.js'

// Scene sequence: gate → intro → headline → cake → (balloons) → (photo)
// → boxes → (scratch) → letter → finale. Interactive scenes wait for the
// recipient; ambient ones auto-advance (tap skips).
// "tap to skip" scenes auto-advance after 5s; interactive scenes get a
// generous fallback so nobody is ever stuck.
const DURATIONS = { intro: 5000, headline: 5000, cake: 14000, photo: 5000, boxes: 20000 }

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

// Living background: soft drifting glow-blobs + twinkling stars, colored by
// the vibe — plus weather layers for the nature vibes.
function VibeBackdrop({ vibe }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        dur: 2 + Math.random() * 3.5,
        size: 1.5 + Math.random() * 2.5,
      })),
    []
  )
  const drops = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 0.6 + Math.random() * 0.7,
        h: 14 + Math.random() * 18,
      })),
    []
  )
  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 9,
        dur: 7 + Math.random() * 9,
        size: 5 + Math.random() * 14,
      })),
    []
  )
  const rainy = vibe === 'rain' || vibe === 'thunder'
  return (
    <div className="backdrop" aria-hidden>
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      {rainy && drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{ left: `${d.left}%`, height: d.h, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
        />
      ))}
      {vibe === 'thunder' && <div className="lightning" />}
      {vibe === 'sea' && bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
        />
      ))}
      {vibe === 'sea' && (
        <svg className="scenery waves" viewBox="0 0 1200 140" preserveAspectRatio="none">
          <path d="M0 70 Q150 30 300 70 T600 70 T900 70 T1200 70 V140 H0 Z" fill="rgba(168,240,255,0.16)" />
          <path d="M0 95 Q150 55 300 95 T600 95 T900 95 T1200 95 V140 H0 Z" fill="rgba(168,240,255,0.22)" />
        </svg>
      )}
      {vibe === 'mountain' && (
        <svg className="scenery" viewBox="0 0 1200 260" preserveAspectRatio="none">
          <path d="M0 260 L180 90 L300 200 L470 40 L640 210 L820 80 L1000 220 L1200 120 V260 Z" fill="rgba(20,14,45,0.75)" />
          <path d="M0 260 L120 180 L260 240 L430 130 L620 250 L790 160 L980 255 L1200 190 V260 Z" fill="rgba(38,28,80,0.85)" />
          <path d="M455 60 L470 40 L487 62 Z" fill="rgba(255,255,255,0.85)" />
          <path d="M805 98 L820 80 L836 100 Z" fill="rgba(255,255,255,0.75)" />
        </svg>
      )}
      {vibe === 'desert' && (
        <>
          <span className="desert-sun" />
          <svg className="scenery" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path d="M0 200 Q300 90 620 160 T1200 130 V200 Z" fill="rgba(120,64,20,0.55)" />
            <path d="M0 200 Q420 140 780 185 T1200 175 V200 Z" fill="rgba(160,92,35,0.65)" />
          </svg>
        </>
      )}
    </div>
  )
}

// Interactive cake: tap each flame (or blow into the mic) to put candles out.
function CakeScene({ cake, line, onDone }) {
  const [lit, setLit] = useState([true, true, true])
  const [micOn, setMicOn] = useState(false)
  const micRef = useRef(null)
  const allOut = lit.every((l) => !l)

  const blow = (i) => setLit((prev) => prev.map((l, idx) => (idx === i ? false : l)))

  const enableMic = async (e) => {
    e.stopPropagation()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const actx = new (window.AudioContext || window.webkitAudioContext)()
      const src = actx.createMediaStreamSource(stream)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      micRef.current = { stream, actx, alive: true }
      setMicOn(true)
      let lastBlow = 0
      const tick = () => {
        if (!micRef.current?.alive) return
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const v of data) { const d = (v - 128) / 128; sum += d * d }
        const rms = Math.sqrt(sum / data.length)
        if (rms > 0.24 && Date.now() - lastBlow > 550) {
          lastBlow = Date.now()
          setLit((prev) => {
            const i = prev.findIndex(Boolean)
            return i === -1 ? prev : prev.map((l, idx) => (idx === i ? false : l))
          })
        }
        requestAnimationFrame(tick)
      }
      tick()
    } catch { /* mic denied — tapping still works */ }
  }

  useEffect(() => () => {
    if (micRef.current) {
      micRef.current.alive = false
      micRef.current.stream.getTracks().forEach((t) => t.stop())
      micRef.current.actx.close().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!allOut) return
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [allOut, onDone])

  return (
    <div className="scene" onClick={(e) => e.stopPropagation()}>
      <div className="cake-float"><Cake colors={cake.colors} lit={lit} onBlow={blow} /></div>
      {allOut ? (
        <p className="line pop">✨ Wish made! It’s on its way... ✨</p>
      ) : (
        <>
          <p className="line fade-late">{line}</p>
          <p className="cake-hint fade-late">tap the flames to blow them out{micOn ? ' — or just blow! 🎤' : ''}</p>
          {!micOn && (
            <button className="btn ghost mic-btn fade-late" onClick={enableMic}>🎤 Blow for real</button>
          )}
        </>
      )}
    </div>
  )
}

// Pick one of three gift boxes; each hides a mini message.
function BoxesScene({ name, onDone }) {
  const [picked, setPicked] = useState(null)
  const msgs = useMemo(() => BOX_MESSAGES(name), [name])
  return (
    <div className="scene" onClick={(e) => e.stopPropagation()}>
      <h2 className="line">Pick a gift box, {name} 🎀</h2>
      <div className="boxes-row">
        {msgs.map((m, i) => (
          <button
            key={i}
            className={`gift-box ${picked === i ? 'opened' : picked != null ? 'dimmed' : ''}`}
            onClick={() => picked == null && setPicked(i)}
          >
            {picked === i ? '🎉' : ['🎁', '💝', '🎀'][i]}
          </button>
        ))}
      </div>
      {picked != null && (
        <>
          <div className="wish-reveal pop">{msgs[picked]}</div>
          <div><button className="btn primary continue-btn" onClick={onDone}>Continue →</button></div>
        </>
      )}
    </div>
  )
}

// Scratch the foil to reveal a hidden message.
function ScratchScene({ text, onDone }) {
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const scratching = useRef(false)
  const started = useRef(false)

  // One touch is enough: 3s after the first scratch, the foil clears itself.
  const armAutoReveal = () => {
    if (started.current) return
    started.current = true
    setTimeout(() => setRevealed(true), 3000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const g = canvas.getContext('2d')
    const grad = g.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, '#b8b8c4')
    grad.addColorStop(0.5, '#e8e8f0')
    grad.addColorStop(1, '#9a9aa8')
    g.fillStyle = grad
    g.fillRect(0, 0, canvas.width, canvas.height)
    g.fillStyle = '#77778a'
    g.font = 'bold 22px Quicksand, sans-serif'
    g.textAlign = 'center'
    g.fillText('scratch here ✨', canvas.width / 2, canvas.height / 2 + 8)
  }, [])

  const scratch = (e) => {
    if (revealed) return
    armAutoReveal()
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const pt = e.touches?.[0] || e
    const x = (pt.clientX - rect.left) * (canvas.width / rect.width)
    const y = (pt.clientY - rect.top) * (canvas.height / rect.height)
    const g = canvas.getContext('2d')
    g.globalCompositeOperation = 'destination-out'
    g.beginPath()
    g.arc(x, y, 26, 0, Math.PI * 2)
    g.fill()
    // sample transparency to detect "mostly scratched"
    const img = g.getImageData(0, 0, canvas.width, canvas.height).data
    let clear = 0
    for (let i = 3; i < img.length; i += 16 * 4) if (img[i] === 0) clear++
    if (clear / (img.length / (16 * 4)) > 0.5) setRevealed(true)
  }

  return (
    <div className="scene" onClick={(e) => e.stopPropagation()}>
      <h2 className="line">A secret, hidden for you 🤫</h2>
      <div className="scratch-wrap pop">
        <div className="scratch-message">{text}</div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={420} height={200}
            className="scratch-foil"
            onMouseDown={(e) => { scratching.current = true; scratch(e) }}
            onMouseMove={(e) => scratching.current && scratch(e)}
            onMouseUp={() => { scratching.current = false }}
            onMouseLeave={() => { scratching.current = false }}
            onTouchStart={scratch}
            onTouchMove={scratch}
          />
        )}
      </div>
      {revealed && <div><button className="btn primary continue-btn" onClick={onDone}>Continue →</button></div>}
    </div>
  )
}

// Old parchment letter, folded and closed with a wax seal; tapping the seal
// unfolds it and the message writes itself in handwriting.
function VintageLetter({ text, voice, onDone }) {
  const [stage, setStage] = useState('sealed') // sealed → opening → open
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const open = () => {
    if (stage !== 'sealed') return
    setStage('opening')
    setTimeout(() => setStage('open'), 1300)
  }
  const toggleVoice = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(voice)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().catch(() => {}); setPlaying(true) }
  }
  useEffect(() => () => audioRef.current?.pause(), [])
  return (
    <div className={`letter3d ${stage}`} onClick={(e) => e.stopPropagation()}>
      {stage === 'sealed' && <p className="seal-hint fade-late">Tap the seal to open 💌</p>}
      <div className={`parchment ${stage}`} onClick={open}>
        <div className="parchment-inner">
          <div className="letter-salut">A letter, written just for you</div>
          {stage === 'open' && <Typewriter text={text} speed={40} />}
        </div>
        {stage !== 'open' && (
          <button className="wax-seal" onClick={open} aria-label="open the letter">
            <span>H♥C</span>
          </button>
        )}
      </div>
      {stage === 'open' && (
        <div className="letter-actions">
          {voice && (
            <button className="btn ghost" onClick={toggleVoice}>
              {playing ? '⏸ Pause voice note' : '▶️ Play voice note 🎙️'}
            </button>
          )}
          <button className="btn primary" onClick={onDone}>Continue →</button>
        </div>
      )}
    </div>
  )
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

// "Send a hug back" — recipient reaction on the finale.
function ReactionBar({ code, onSent }) {
  const [sent, setSent] = useState(false)
  const [pickedEmoji, setPickedEmoji] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  if (!code || !supabaseEnabled()) return null
  if (sent) return <p className="reaction-done pop">Your hug is on its way! 🤗💌</p>

  const send = async (e) => {
    e.stopPropagation()
    if (!pickedEmoji || busy) return
    setBusy(true)
    try {
      await sendReaction(code, pickedEmoji, msg.trim())
      setSent(true)
      onSent?.()
    } catch { /* silent — reaction is best-effort */ } finally {
      setBusy(false)
    }
  }

  return (
    <div className="reaction-bar fade-late" onClick={(e) => e.stopPropagation()}>
      <p className="reaction-title">Send something back 💌</p>
      <div className="reaction-emojis">
        {['🤗', '❤️', '🥹', '🎉'].map((em) => (
          <button
            key={em}
            className={`reaction-emoji ${pickedEmoji === em ? 'picked' : ''}`}
            onClick={() => setPickedEmoji(em)}
          >{em}</button>
        ))}
      </div>
      {pickedEmoji && (
        <div className="reaction-msg-row">
          <input
            className="reaction-input" placeholder="say something... (optional)"
            value={msg} maxLength={140} onChange={(e) => setMsg(e.target.value)}
          />
          <button className="btn primary" onClick={send} disabled={busy}>
            {busy ? '...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  )
}

// Live countdown until the special day unlocks the surprise.
function Countdown({ name, target, onUnlock }) {
  const [left, setLeft] = useState(target - Date.now())
  useEffect(() => {
    const t = setInterval(() => {
      const remaining = target - Date.now()
      setLeft(remaining)
      if (remaining <= 0) { clearInterval(t); onUnlock() }
    }, 1000)
    return () => clearInterval(t)
  }, [target, onUnlock])
  const s = Math.max(0, Math.floor(left / 1000))
  const parts = [
    { v: Math.floor(s / 86400), l: 'days' },
    { v: Math.floor((s % 86400) / 3600), l: 'hours' },
    { v: Math.floor((s % 3600) / 60), l: 'mins' },
    { v: s % 60, l: 'secs' },
  ]
  return (
    <div className="scene">
      <div className="gift pop">🔒</div>
      <h1 className="line">Something special is waiting for {name}...</h1>
      <div className="countdown-row">
        {parts.map((p) => (
          <div className="countdown-cell" key={p.l}>
            <span className="countdown-num">{String(p.v).padStart(2, '0')}</span>
            <span className="countdown-label">{p.l}</span>
          </div>
        ))}
      </div>
      <p className="gate-hint">unlocks right on the special day 🗓️</p>
    </div>
  )
}

const MONTH_INDEX = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 }

// Next occurrence of the wish's month/day at local midnight.
function nextOccurrence(month, day) {
  const now = new Date()
  const m = MONTH_INDEX[month]
  if (m == null || !day) return 0
  let d = new Date(now.getFullYear(), m, Number(day))
  if (d.getTime() <= now.getTime()) d = new Date(now.getFullYear() + 1, m, Number(day))
  return d.getTime()
}

export default function Viewer({ wish, code }) {
  const scenes = useMemo(() => {
    const s = ['gate', 'intro', 'headline', 'cake']
    if (wish.occasion === 'birthday' && wish.wishes?.some((w) => w?.trim())) s.push('balloons')
    if (wish.photos?.length || wish.photo) s.push('photo')
    s.push('boxes')
    if (wish.scratch?.trim()) s.push('scratch')
    s.push('letter', 'finale')
    return s
  }, [wish.photo, wish.photos, wish.occasion, wish.wishes, wish.scratch])

  const [i, setI] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // After the recipient sends a reaction: stop the music, fade the whole
  // experience out, and drift back to the "Tap to open" gate screen.
  const endExperience = () => {
    stopMusic()
    setTimeout(() => {
      setLeaving(true)
      setTimeout(() => { setI(0); setLeaving(false) }, 1900)
    }, 2200)
  }

  const unlockTarget = useMemo(
    () => (wish.locked ? nextOccurrence(wish.month, wish.day) : 0),
    [wish.locked, wish.month, wish.day]
  )
  const [locked, setLocked] = useState(() => unlockTarget > Date.now())
  const scene = scenes[i]
  const copy = OCCASION_COPY[wish.occasion] || OCCASION_COPY.birthday
  const cake = byId(CAKES, wish.cake)
  const vibe = byId(VIBES, wish.vibe)
  const name = wish.name || 'You'

  // Preload photos while early scenes play, so the clothesline never shows blanks.
  useEffect(() => {
    const list = wish.photos?.length ? wish.photos : wish.photo ? [wish.photo] : []
    list.forEach((p) => { const img = new Image(); img.src = p })
  }, [wish.photos, wish.photo])

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

  if (locked) {
    return (
      <div className="viewer" style={style}>
        <VibeBackdrop vibe={vibe.id} />
        <Countdown name={name} target={unlockTarget} onUnlock={() => setLocked(false)} />
      </div>
    )
  }

  return (
    <div className={`viewer ${leaving ? 'leaving' : ''}`} style={style} onClick={scene === 'gate' ? undefined : next}>
      <VibeBackdrop vibe={vibe.id} />
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
        <CakeScene cake={cake} line={copy.cakeLine} onDone={next} />
      )}

      {scene === 'balloons' && (
        <BalloonGame
          wishes={(wish.wishes || []).filter((w) => w?.trim())}
          name={name}
          onDone={next}
        />
      )}

      {scene === 'photo' && (
        <div className="scene photos-scene">
          <div className="clothesline">
            <svg className="rope" viewBox="0 0 1000 60" preserveAspectRatio="none">
              <path d="M0 8 Q 500 58 1000 8" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="3" />
            </svg>
            <div className="line-photos">
              {(wish.photos?.length ? wish.photos : [wish.photo]).map((p, idx) => (
                <div className="hang-photo" key={idx} style={{ animationDelay: `${idx * 0.4}s`, '--tilt': `${(idx % 2 ? 1 : -1) * (2 + (idx % 3))}deg` }}>
                  <span className="peg">🧷</span>
                  <img src={p} alt={`memory ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <p className="line fade-late">Moments worth keeping 📸</p>
        </div>
      )}

      {scene === 'boxes' && <BoxesScene name={name} onDone={next} />}

      {scene === 'scratch' && <ScratchScene text={wish.scratch} onDone={next} />}

      {scene === 'letter' && (
        <div className="scene" onClick={(e) => e.stopPropagation()}>
          <VintageLetter text={wish.letter || '...'} voice={wish.voice} onDone={next} />
        </div>
      )}

      {scene === 'finale' && (
        wish.occasion === 'propose' ? (
          <ProposeEnding name={name} />
        ) : (
          <div className="scene" onClick={(e) => e.stopPropagation()}>
            <h1 className="headline pop">{copy.finale}</h1>
            <p className="line fade-late made-with">Made with <span className="brand-heart">❤️</span> on HeartCraft</p>
            <img src="symbol.png" alt="HeartCraft" className="finale-logo fade-late" />
            <ReactionBar code={code} onSent={endExperience} />
          </div>
        )
      )}

      {!['gate', 'letter', 'finale', 'balloons', 'boxes', 'scratch', 'cake'].includes(scene) && (
        <div className="tap-hint">tap to skip</div>
      )}
    </div>
  )
}

// 5 balloons; each pop reveals one wish. Continue unlocks when all are burst.
const BALLOON_COLORS = ['#ff5c8a', '#ffd166', '#8ec5ff', '#b06ef0', '#6fdd8b']

function BalloonGame({ wishes, name, onDone }) {
  const [popped, setPopped] = useState([])
  const [lastWish, setLastWish] = useState(null)
  const allPopped = popped.length >= wishes.length

  const pop = (idx) => (e) => {
    e.stopPropagation()
    if (popped.includes(idx)) return
    setPopped((p) => [...p, idx])
    setLastWish(idx)
  }

  return (
    <div className="scene balloon-scene" onClick={(e) => e.stopPropagation()}>
      <h2 className="line">Pop the balloons, {name}! 🎈</h2>
      <p className="balloon-progress">{popped.length} / {wishes.length} wishes found</p>
      <div className="balloon-field">
        {wishes.map((w, idx) => (
          <div className="balloon-slot" key={idx}>
            {popped.includes(idx) ? (
              <span className="balloon-burst">💥</span>
            ) : (
              <button
                className="balloon"
                style={{ '--b-color': BALLOON_COLORS[idx % BALLOON_COLORS.length], animationDelay: `${idx * 0.35}s` }}
                onClick={pop(idx)}
                aria-label={`balloon ${idx + 1}`}
              >
                <span className="balloon-body" />
                <span className="balloon-string" />
              </button>
            )}
          </div>
        ))}
      </div>
      {lastWish != null && (
        <div className="wish-reveal pop" key={lastWish}>{wishes[lastWish]}</div>
      )}
      {allPopped && (
        <button className="btn primary continue-btn" onClick={onDone}>Continue →</button>
      )}
    </div>
  )
}

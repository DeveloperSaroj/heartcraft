import React, { useEffect, useRef, useState } from 'react'
import { OCCASIONS, CAKES, BONDS, VIBES, LETTER_TEMPLATES, findBadWord, byId } from './options.js'
import { viewerUrl } from './encode.js'
import Viewer from './Viewer.jsx'
import { saveWish } from './supabase.js'
import { supabaseEnabled } from './config.js'
import { trackEvent } from './analytics.js'
import QRCode from 'qrcode'

const MAX_PHOTOS = 5
const MAX_VOICE_SECONDS = 30

// Shrink the image hard so the data-URL keeps the share link a sane length.
async function compressPhoto(file) {
  const dataUrl = await new Promise((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  // With a database the photo goes to real storage, so keep it big & crisp;
  // in URL-mode it must stay tiny to keep the link shareable.
  const MAX = supabaseEnabled() ? 1080 : 280
  const scale = Math.min(1, MAX / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.55)
}

// Record up to 30s from the mic, returned as a data URL for upload.
function VoiceRecorder({ voice, onChange }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const recRef = useRef(null)
  const timerRef = useRef(null)

  const stop = () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }

  const start = async () => {
    setError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setError('This browser does not support voice recording.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // First supported format wins; Safari needs mp4, Chrome/Firefox use webm.
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
        .find((m) => MediaRecorder.isTypeSupported(m))
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      const chunks = []
      rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data) }
      rec.onerror = () => {
        stream.getTracks().forEach((t) => t.stop())
        setError('Recording failed — please try again.')
        setRecording(false)
        clearInterval(timerRef.current)
      }
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        if (!chunks.length) { setError('Nothing was recorded — please try again.'); return }
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
        const r = new FileReader()
        r.onload = () => onChange(r.result)
        r.readAsDataURL(blob)
      }
      recRef.current = rec
      rec.start(250) // gather data in small chunks so nothing is lost on stop
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_VOICE_SECONDS) stop()
          return s + 1
        })
      }, 1000)
    } catch (err) {
      setError(err?.name === 'NotAllowedError'
        ? 'Microphone permission was denied — allow it in your browser’s site settings and try again.'
        : 'Microphone not available — you can still send the letter without a voice note.')
    }
  }

  useEffect(() => () => { clearInterval(timerRef.current); recRef.current?.state === 'recording' && recRef.current.stop() }, [])

  if (!supabaseEnabled()) return null
  return (
    <div className="voice-box">
      <div className="field-label">Voice note 🎙️ (optional, up to {MAX_VOICE_SECONDS}s)</div>
      {voice ? (
        <div className="voice-row">
          <audio controls src={voice} className="voice-player" />
          <button className="btn ghost" onClick={() => onChange('')}>Remove ✖</button>
        </div>
      ) : recording ? (
        <div className="voice-row">
          <span className="rec-dot" /> Recording... {seconds}s
          <button className="btn primary" onClick={stop}>⏹ Stop</button>
        </div>
      ) : (
        <button className="btn ghost upload-btn voice-btn" onClick={start}>🎙️ Record a voice note</button>
      )}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function CardGrid({ items, value, onPick }) {
  return (
    <div className="card-grid">
      {items.map((it) => (
        <button
          key={it.id}
          className={`pick-card ${value === it.id ? 'selected' : ''}`}
          onClick={() => onPick(it.id)}
        >
          <span className="pick-emoji">{it.emoji}</span>
          <span className="pick-label">{it.label}</span>
          {it.tagline && <span className="pick-tag">{it.tagline}</span>}
        </button>
      ))}
    </div>
  )
}

function rememberWish(code, token, wish) {
  try {
    const mine = JSON.parse(localStorage.getItem('hc-my-wishes') || '[]')
    mine.unshift({ code, delToken: token, name: wish.name, occasion: wish.occasion, ts: Date.now() })
    localStorage.setItem('hc-my-wishes', JSON.stringify(mine.slice(0, 100)))
  } catch { /* storage unavailable */ }
}

export default function Wizard() {
  const [step, setStep] = useState(0)
  const [wish, setWish] = useState({
    name: '', month: '', day: '', locked: false,
    occasion: '', cake: '', bond: '', vibe: '', letter: '', scratch: '', voice: '', photos: [],
    fromCity: '', toCity: '', reunionDate: '',
    wishes: [
      'May all your dreams come true ✨',
      'A year full of laughter 😄',
      'Endless love & happiness 💖',
    ],
  })
  const [previewing, setPreviewing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shortUrl, setShortUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [contentError, setContentError] = useState('')
  const [qr, setQr] = useState('')
  const set = (k) => (v) => setWish((w) => ({ ...w, [k]: v }))

  // Live vibe preview: while choosing a vibe, paint the page in that theme.
  useEffect(() => {
    const isVibeStep = steps[step]?.title.startsWith('Choose the vibe')
    if (isVibeStep && wish.vibe) {
      const t = byId(VIBES, wish.vibe).theme
      document.body.style.background =
        `radial-gradient(circle at 50% 12%, ${t.bg2} 0%, transparent 65%), linear-gradient(170deg, ${t.bg1} 0%, #16041f 100%)`
    } else {
      document.body.style.background = ''
    }
    return () => { document.body.style.background = '' }
  })

  const steps = [
    {
      title: 'Who is this for?',
      valid: wish.name.trim() && wish.month && wish.day,
      body: (
        <>
          <label className="field-label">Their name</label>
          <input
            className="text-input" placeholder="e.g. Priya" value={wish.name}
            onChange={(e) => set('name')(e.target.value)} maxLength={30} autoFocus
          />
          <label className="field-label">When is the special day? 📅</label>
          <div className="date-row">
            <select className="select-input" value={wish.month} onChange={(e) => set('month')(e.target.value)}>
              <option value="">Month</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="select-input" value={wish.day} onChange={(e) => set('day')(e.target.value)}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <label className="lock-row">
            <input
              type="checkbox" checked={wish.locked}
              onChange={(e) => set('locked')(e.target.checked)}
            />
            <span>🔒 Lock until the special day — they’ll see a live countdown until midnight of {wish.month || 'the day'} {wish.day || ''}</span>
          </label>
        </>
      ),
    },
    {
      title: 'What’s the occasion?',
      valid: !!wish.occasion,
      body: <CardGrid items={OCCASIONS} value={wish.occasion} onPick={set('occasion')} />,
    },
    // Cake & bond don't fit a "miss you" — skip both for that occasion.
    ...(wish.occasion === 'missyou' ? [] : [
      {
        title: 'Pick a cake 🎂',
        valid: !!wish.cake,
        body: <CardGrid items={CAKES} value={wish.cake} onPick={set('cake')} />,
      },
      {
        title: `What’s your bond with ${wish.name || 'them'}?`,
        valid: !!wish.bond,
        body: <CardGrid items={BONDS} value={wish.bond} onPick={set('bond')} />,
      },
    ]),
    {
      title: 'Choose the vibe ✨',
      valid: !!wish.vibe,
      body: <CardGrid items={VIBES} value={wish.vibe} onPick={set('vibe')} />,
    },
    ...(wish.occasion === 'birthday' ? [{
      title: 'Their 3 balloon wishes 🎈',
      valid: wish.wishes.every((w) => w.trim()),
      body: (
        <>
          <p className="field-hint">{wish.name || 'They'} will pop 3 balloons — each one reveals a wish. Make them yours!</p>
          {wish.wishes.map((w, idx) => (
            <div className="wish-row" key={idx}>
              <span className="wish-balloon">🎈</span>
              <input
                className="text-input" value={w} maxLength={60}
                onChange={(e) => {
                  const next = [...wish.wishes]
                  next[idx] = e.target.value
                  set('wishes')(next)
                }}
              />
            </div>
          ))}
        </>
      ),
    }] : []),
    ...(wish.occasion === 'missyou' ? [{
      title: 'The miles between you 🗺️',
      valid: wish.fromCity.trim() && wish.toCity.trim(),
      body: (
        <>
          <p className="field-hint">They’ll see a little heart fly across the map from your city to theirs. 🤍</p>
          <label className="field-label">Your city</label>
          <input
            className="text-input" placeholder="e.g. Bhubaneswar" value={wish.fromCity}
            maxLength={40} onChange={(e) => set('fromCity')(e.target.value)}
          />
          <label className="field-label">Their city</label>
          <input
            className="text-input" placeholder="e.g. Bengaluru" value={wish.toCity}
            maxLength={40} onChange={(e) => set('toCity')(e.target.value)}
          />
          <label className="field-label">Reunion date 🗓️ (optional)</label>
          <input
            className="text-input" type="date" value={wish.reunionDate}
            onChange={(e) => set('reunionDate')(e.target.value)}
          />
          <p className="field-hint" style={{ marginTop: 6 }}>Add the day you’ll meet again and they’ll see a live countdown to it.</p>
        </>
      ),
    }] : []),
    {
      title: 'Add photos 📸 (optional)',
      valid: true,
      body: (
        <>
          <p className="field-hint">Add up to {MAX_PHOTOS} photos — they’ll hang like polaroids on a clothesline in the surprise. 🧷</p>
          <input
            id="photo-input" type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={async (e) => {
              const files = [...(e.target.files || [])].slice(0, MAX_PHOTOS - wish.photos.length)
              const compressed = await Promise.all(files.map(compressPhoto))
              set('photos')([...wish.photos, ...compressed])
              e.target.value = ''
            }}
          />
          {wish.photos.length > 0 && (
            <div className="photo-grid">
              {wish.photos.map((p, idx) => (
                <div className="photo-thumb" key={idx}>
                  <img src={p} alt={`photo ${idx + 1}`} />
                  <button
                    className="photo-remove"
                    onClick={() => set('photos')(wish.photos.filter((_, i) => i !== idx))}
                  >✖</button>
                </div>
              ))}
            </div>
          )}
          {wish.photos.length < MAX_PHOTOS && (
            <button className="btn ghost upload-btn" onClick={() => document.getElementById('photo-input').click()}>
              ⬆️ {wish.photos.length ? 'Add more photos' : 'Upload photos'} ({wish.photos.length}/{MAX_PHOTOS})
            </button>
          )}
        </>
      ),
    },
    {
      title: 'Write a special letter 💌',
      valid: wish.letter.trim().length > 0,
      body: (
        <>
          <div className="template-row">
            <span className="field-hint" style={{ marginBottom: 0 }}>Need inspiration?</span>
            {LETTER_TEMPLATES.map((t) => (
              <button key={t.id} className="template-chip" onClick={() => set('letter')(t.text(wish.name || 'you'))}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <textarea
            className="letter-input" rows={7} maxLength={600}
            placeholder={`Dear ${wish.name || '...'},\nWrite something from your heart...`}
            value={wish.letter} onChange={(e) => set('letter')(e.target.value)}
          />
          <div className="char-count">{wish.letter.length}/600</div>
          <VoiceRecorder voice={wish.voice} onChange={set('voice')} />
          <label className="field-label">Hidden scratch-card message 🤫 (optional)</label>
          <input
            className="text-input" maxLength={90} value={wish.scratch}
            placeholder="A secret they must scratch to reveal..."
            onChange={(e) => set('scratch')(e.target.value)}
          />
        </>
      ),
    },
  ]

  const url = shortUrl || viewerUrl(wish)

  // Creates the DB-backed short link once, on demand; falls back to the long URL.
  const ensureShortLink = async () => {
    if (shortUrl) return shortUrl
    if (!supabaseEnabled()) return url
    setSaveError('')
    setSaving(true)
    try {
      const { code, token } = await saveWish(wish)
      const base = window.location.origin + window.location.pathname
      const su = `${base}#/w/${code}`
      setShortUrl(su)
      rememberWish(code, token, wish)
      trackEvent('created', { occasion: wish.occasion, wishCode: code })
      return su
    } catch {
      setSaveError('Could not create short link — copied the long link instead (it works too!)')
      return url
    } finally {
      setSaving(false)
    }
  }

  const showQr = async () => {
    if (qr) { setQr(''); return }
    try {
      const link = await ensureShortLink()
      setQr(await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#3a2440', light: '#ffffff' } }))
    } catch { /* qr unavailable */ }
  }

  const last = step === steps.length - 1
  const cur = steps[step]

  const copy = async () => {
    if (saving) return
    const link = await ensureShortLink()
    try { await navigator.clipboard.writeText(link) } catch { /* select box remains */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tryPreview = () => {
    const bad = findBadWord([wish.letter, wish.scratch, ...(wish.wishes || [])].join(' '))
    if (bad) {
      setContentError('Please keep the message kind — remove the strong language and try again. 💗')
      return
    }
    setContentError('')
    setPreviewing(true)
  }

  if (previewing) {
    return (
      <div className="preview-wrap">
        <Viewer wish={wish} key={Date.now()} />
        <div className="preview-bar">
          <button className="btn ghost" onClick={() => { setPreviewing(false); setShortUrl(''); setSaveError(''); setQr('') }}>← Edit</button>
          <input className="url-box" readOnly value={url} onFocus={(e) => e.target.select()} />
          <button className="btn ghost" onClick={showQr}>QR</button>
          <button className="btn primary" onClick={copy} disabled={saving}>
            {saving ? 'Creating... ⏳' : copied ? 'Copied! ✅' : 'Copy link 🔗'}
          </button>
          {saveError && <span className="save-error">{saveError}</span>}
        </div>
        {qr && (
          <div className="qr-modal" onClick={() => setQr('')}>
            <div className="qr-card" onClick={(e) => e.stopPropagation()}>
              <img src={qr} alt="QR code for this wish" />
              <p>Scan to open the surprise 💗</p>
              <a className="btn primary" href={qr} download="smileheart-qr.png">Download PNG</a>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="wizard">
      <header className="brand">
        <img src="logo-full.png" alt="SmileHeart — crafting beautiful wishes, delivering smiles" className="brand-logo" />
        <a className="mine-link" href="#/mine">My wishes 📂</a>
      </header>
      <div className="progress">
        {steps.map((_, i) => (
          <span key={i} className={`dot ${i <= step ? 'on' : ''}`} />
        ))}
      </div>
      <div className="step-card" key={step}>
        <h2 className="step-title">{cur.title}</h2>
        {cur.body}
      </div>
      {contentError && <div className="field-error content-error">{contentError}</div>}
      <div className="nav-row">
        {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>← Back</button>}
        <button
          className="btn primary" disabled={!cur.valid}
          onClick={() => (last ? tryPreview() : setStep(step + 1))}
        >
          {last ? 'See Preview ✨' : 'Next →'}
        </button>
      </div>
      <footer className="app-footer">
        <span>🔒 Privacy-friendly — no accounts, no ads, no cookies.</span>
        <span className="footer-links">
          <a href="#/privacy">Privacy Policy</a> · <a href="#/terms">Terms of Use</a>
        </span>
      </footer>
    </div>
  )
}

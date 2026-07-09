import React, { useState } from 'react'
import { OCCASIONS, CAKES, BONDS, VIBES } from './options.js'
import { viewerUrl } from './encode.js'
import Viewer from './Viewer.jsx'

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
  const MAX = 280
  const scale = Math.min(1, MAX / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.55)
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

export default function Wizard() {
  const [step, setStep] = useState(0)
  const [wish, setWish] = useState({
    name: '', month: '', day: '',
    occasion: '', cake: '', bond: '', vibe: '', letter: '', photo: '',
  })
  const [previewing, setPreviewing] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k) => (v) => setWish((w) => ({ ...w, [k]: v }))

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
        </>
      ),
    },
    {
      title: 'What’s the occasion?',
      valid: !!wish.occasion,
      body: <CardGrid items={OCCASIONS} value={wish.occasion} onPick={set('occasion')} />,
    },
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
    {
      title: 'Choose the vibe ✨',
      valid: !!wish.vibe,
      body: <CardGrid items={VIBES} value={wish.vibe} onPick={set('vibe')} />,
    },
    {
      title: 'Add a photo 📸 (optional)',
      valid: true,
      body: (
        <>
          <p className="field-hint">A photo makes the surprise extra personal. It’s compressed and stored inside the link itself — skip it if you want a short, tidy URL.</p>
          <input
            id="photo-input" type="file" accept="image/*" style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) set('photo')(await compressPhoto(file))
            }}
          />
          {wish.photo ? (
            <div className="photo-preview">
              <img src={wish.photo} alt="preview" />
              <div className="photo-actions">
                <button className="btn ghost" onClick={() => document.getElementById('photo-input').click()}>Change</button>
                <button className="btn ghost" onClick={() => set('photo')('')}>Remove ✖</button>
              </div>
            </div>
          ) : (
            <button className="btn ghost upload-btn" onClick={() => document.getElementById('photo-input').click()}>
              ⬆️ Upload a photo
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
          <textarea
            className="letter-input" rows={7} maxLength={600}
            placeholder={`Dear ${wish.name || '...'},\nWrite something from your heart...`}
            value={wish.letter} onChange={(e) => set('letter')(e.target.value)}
          />
          <div className="char-count">{wish.letter.length}/600</div>
        </>
      ),
    },
  ]

  const url = viewerUrl(wish)
  const last = step === steps.length - 1
  const cur = steps[step]

  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch { /* select box remains */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (previewing) {
    return (
      <div className="preview-wrap">
        <Viewer wish={wish} key={Date.now()} />
        <div className="preview-bar">
          <button className="btn ghost" onClick={() => setPreviewing(false)}>← Edit</button>
          <input className="url-box" readOnly value={url} onFocus={(e) => e.target.select()} />
          <button className="btn primary" onClick={copy}>{copied ? 'Copied! ✅' : 'Copy link 🔗'}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="wizard">
      <header className="brand">
        <span className="brand-heart">💗</span> HeartCraft
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
      <div className="nav-row">
        {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>← Back</button>}
        <button
          className="btn primary" disabled={!cur.valid}
          onClick={() => (last ? setPreviewing(true) : setStep(step + 1))}
        >
          {last ? 'See Preview ✨' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

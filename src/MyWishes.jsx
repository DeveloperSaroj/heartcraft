import React, { useEffect, useState } from 'react'
import { OCCASIONS, byId } from './options.js'
import { fetchStats } from './supabase.js'
import { supabaseEnabled } from './config.js'

// Creator dashboard: wishes made on this device, with opens & reactions.
export default function MyWishes() {
  const [mine, setMine] = useState([])
  const [stats, setStats] = useState({ wishes: [], reactions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let list = []
    try { list = JSON.parse(localStorage.getItem('hc-my-wishes') || '[]') } catch { /* ignore */ }
    setMine(list)
    if (!supabaseEnabled() || !list.length) { setLoading(false); return }
    fetchStats(list.map((m) => m.code))
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const viewsOf = (code) => stats.wishes.find((w) => w.short_code === code)?.view_count ?? '—'
  const reactionsOf = (code) => stats.reactions.filter((r) => r.wish_code === code)

  const base = window.location.origin + window.location.pathname

  return (
    <div className="wizard">
      <header className="brand">
        <img src="logo-full.png" alt="HeartCraft" className="brand-logo" />
        <a className="mine-link" href="#">← Create a wish</a>
      </header>
      <div className="step-card">
        <h2 className="step-title">My wishes 📂</h2>
        {loading && <p className="field-hint">Loading your wishes...</p>}
        {!loading && !mine.length && (
          <p className="field-hint">No wishes yet — <a href="#">create your first one 💗</a></p>
        )}
        {mine.map((m) => {
          const occ = byId(OCCASIONS, m.occasion)
          const reactions = reactionsOf(m.code)
          return (
            <div className="mywish-card" key={m.code}>
              <div className="mywish-head">
                <span className="mywish-title">{occ.emoji} {occ.label} for <b>{m.name}</b></span>
                <span className="mywish-date">{new Date(m.ts).toLocaleDateString()}</span>
              </div>
              <div className="mywish-stats">
                <span>👀 {viewsOf(m.code)} opens</span>
                <a href={`${base}#/w/${m.code}`} target="_blank" rel="noreferrer">Open link ↗</a>
                <button
                  className="template-chip"
                  onClick={() => navigator.clipboard.writeText(`${base}#/w/${m.code}`).catch(() => {})}
                >Copy link 🔗</button>
              </div>
              {reactions.length > 0 && (
                <div className="mywish-reactions">
                  {reactions.map((r, i) => (
                    <div key={i} className="mywish-reaction">
                      <span>{r.emoji}</span>
                      {r.message && <span className="mywish-reaction-msg">“{r.message}”</span>}
                      <span className="mywish-date">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

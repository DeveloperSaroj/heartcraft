import React, { useEffect, useState } from 'react'
import { OCCASIONS, byId } from './options.js'
import { fetchStats, deleteWish } from './supabase.js'
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

  const [busy, setBusy] = useState('')

  const persist = (list) => {
    setMine(list)
    try { localStorage.setItem('hc-my-wishes', JSON.stringify(list)) } catch { /* ignore */ }
  }

  const removeOne = async (m) => {
    if (!window.confirm(`Delete the ${byId(OCCASIONS, m.occasion).label} wish for ${m.name}? The link will stop working for everyone.`)) return
    setBusy(m.code)
    try { await deleteWish(m.code, m.delToken) } catch { /* link may already be gone */ } finally { setBusy('') }
    persist(mine.filter((x) => x.code !== m.code))
  }

  const clearAll = async () => {
    if (!window.confirm('Delete ALL these wishes? Every link will stop working for everyone.')) return
    setBusy('all')
    for (const m of mine) { try { await deleteWish(m.code, m.delToken) } catch { /* ignore */ } }
    setBusy('')
    persist([])
  }

  const base = window.location.origin + window.location.pathname

  return (
    <div className="wizard">
      <header className="brand">
        <img src="logo-full.png" alt="SmileHeart" className="brand-logo" />
        <a className="mine-link" href="#">← Create a wish</a>
      </header>
      <div className="step-card">
        <div className="mywish-header-row">
          <h2 className="step-title" style={{ marginBottom: 0 }}>My wishes 📂</h2>
          {mine.length > 0 && (
            <button className="template-chip mywish-clear-all" onClick={clearAll} disabled={!!busy}>
              {busy === 'all' ? 'Deleting…' : 'Clear all 🗑️'}
            </button>
          )}
        </div>
        {mine.length > 0 && <p className="field-hint">Deleting a wish here removes it for everyone — its link will stop working.</p>}
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
                <span className="mywish-head-right">
                  <span className="mywish-date">{new Date(m.ts).toLocaleDateString()}</span>
                  <button className="mywish-remove" onClick={() => removeOne(m)} disabled={!!busy} aria-label="delete wish" title="Delete wish (stops the link)">{busy === m.code ? '…' : '✕'}</button>
                </span>
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

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'
import { supabaseEnabled } from './config.js'

// Aggregate, non-identifying analytics — browser/OS/device family only.
// No IP, no fingerprinting, no personal data. Query results via Supabase
// SQL Editor (see db/schema-v3.sql for the ready-made views).

function parseUserAgent(ua) {
  ua = ua || ''
  let browser = 'Other'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/CriOS/.test(ua)) browser = 'Chrome (iOS)'
  else if (/FxiOS/.test(ua)) browser = 'Firefox (iOS)'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari'

  let os = 'Other'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua) && !/Mobile/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  const device = /iPad|Tablet/.test(ua) ? 'tablet' : /Mobi|Android|iPhone/.test(ua) ? 'mobile' : 'desktop'
  return { browser, os, device }
}

// Fire-and-forget — analytics must never block or break the wish experience.
export function trackEvent(eventType, { occasion, wishCode } = {}) {
  if (!supabaseEnabled()) return
  try {
    const { browser, os, device } = parseUserAgent(navigator.userAgent)
    fetch(`${SUPABASE_URL}/rest/v1/rpc/log_wish_event`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_event_type: eventType,
        p_wish_code: wishCode || null,
        p_occasion: occasion || null,
        p_browser: browser,
        p_os: os,
        p_device_type: device,
        p_referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
      }),
    }).catch(() => {})
  } catch { /* never let analytics break the app */ }
}

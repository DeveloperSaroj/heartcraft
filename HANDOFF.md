# SmileHeart — Session Handoff

> Working doc so any new chat session can continue seamlessly. Last updated: 2026-07-18.

## What this is
**SmileHeart** (renamed from "HeartCraft" on 2026-07-16) — a personal web app to create & share
animated surprise experiences (birthday, anniversary, apology, propose, miss you, festivals, etc.).
Recipient opens one link and an animated sequence plays. **Live at https://smileheart.in**.

- Repo: `/Users/rcs/heartcraft` (own git repo, separate from the amagi workspace it's opened in).
- Stack: Vite + React 18, plain CSS. No component library. Backend = Supabase (free tier).
- Hosting: GitHub Pages, repo `DeveloperSaroj/heartcraft` (public). Auto-deploys on push to `main`
  via `.github/workflows/deploy.yml`. Custom domain via `public/CNAME` (smileheart.in), Enforce-HTTPS ON.
- Dev server: `npm run dev` (port 5199). Build: `npm run build`.

## Golden rule (from the user)
**Never commit/push without explicit confirmation.** Always: change locally → verify in preview →
show the user → they say "push"/"deploy" → then commit + push. Pushing to `main` = production deploy.

## Architecture map
- `src/App.jsx` — hash router: `#/w/<code>` (DB short link), `#/view/<base64>` (URL-mode, no DB),
  `#/mine` (My Wishes), `#/privacy`, `#/terms`. Shows `Splash` once/session on the creator page.
- `src/Wizard.jsx` — creator flow (steps built as an array; occasion-specific steps inserted
  conditionally). "Copy link" calls `saveWish` → DB short link. Stores history + delete token in localStorage (`hc-my-wishes`).
- `src/Viewer.jsx` — the animated experience. Scene list built in `scenes` useMemo based on occasion.
  Scenes: gate → intro → headline → cake → (balloons, birthday only) → (photo) → boxes → (scratch) → letter → finale.
  Miss You is special: distance + reunion scenes, and SKIPS cake/boxes. `DURATIONS` = auto-advance ms per ambient scene.
- `src/Splash.jsx` — intro animation (medallion + hearts), once per session.
- `src/MyWishes.jsx` — creator dashboard (localStorage history) with per-wish delete + Clear all.
- `src/options.js` — OCCASIONS, CAKES, BONDS, VIBES, OCCASION_COPY, templates, profanity filter.
- `src/supabase.js` — REST wrappers: saveWish (returns {code, token}), loadWish, deleteWish, sendReaction, fetchStats.
- `src/analytics.js` — trackEvent → log_wish_event RPC.
- `src/config.js` — Supabase URL + anon key (safe/public).
- `db/schema*.sql` — v1–v4 migrations, run MANUALLY in Supabase SQL Editor.

## Supabase (see memory `reference_heartcraft_supabase.md` for creds)
- Project host `eibreokmdskbeyotheav.supabase.co` (project still named "HeartCraft"). Dashboard login sarojbarik626@gmail.com (Google).
- Tables: `wishes` (payload jsonb incl. `_host` tag, `delete_hash`), `reactions`, `wish_events`.
- Anon can't reliably delete/insert via bare RLS → **use SECURITY DEFINER RPCs** (`increment_views`,
  `log_wish_event`, `delete_wish`). This pattern is load-bearing; don't fight RLS with raw policies.
- Creator-owned delete: wish stores sha256(token); token kept only on creator's device (localStorage).
  `delete_wish(code, token)` hashes server-side & deletes only on match → link then shows the expired message.
- **New DB columns/RPCs must be applied via SQL Editor BEFORE deploying code that uses them**, or
  creation breaks on prod (learned the hard way with `delete_hash`).
- Storage bucket `photos` (photos + voice notes) — clear only via dashboard Storage UI, not SQL.

## Testing notes (preview tool gotchas)
- Walk viewer flows in ONE continuous `preview_eval` — separate calls let background timers auto-advance
  scenes between calls, producing false "stuck" readings.
- To screenshot a fast/auto-advancing scene, temporarily bump its `DURATIONS` value, capture, then restore.
- Use inline `#/view/<base64>` links for viewer tests (no DB writes). Short links hit the live DB.

## State as of this handoff
- Everything is deployed & live. DB was truncated clean before launch. HTTPS enforced.
- Pending/optional ideas discussed but NOT done: clear leftover test files in Storage UI; deeper analytics;
  Sentry error tracking; multi-language; a private admin path to delete any wish.

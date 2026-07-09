# HeartCraft 💗

Create and share animated surprise experiences — Birthday, Anniversary, Apology, Propose.

## How it works
- **Creator wizard**: name & date → occasion → cake → bond → vibe → optional photo → letter → preview + share link.
- **Viewer**: opening the link plays an animated sequence (gift gate → intro → headline → cake → photo → typewriter letter → confetti finale). Propose endings get Yes / runaway-No buttons.
- **No backend**: the whole wish is base64url-encoded JSON in the URL hash (`#/view/<data>`), so links work on any static host forever.
- **Music**: synthesized in the browser with WebAudio (Happy Birthday for birthdays, soft arpeggio otherwise) — no audio assets.

## Run
```bash
npm install
npm run dev      # http://localhost:5199
npm run build    # static bundle in dist/ — deploy anywhere
```

// Tiny WebAudio music box — no audio assets needed.
// Soft bell-like lead + warm pad chords + gentle echo, tuned to feel like a
// music box rather than a raw synth. "Happy Birthday" for birthdays, a
// dreamy waltz arpeggio otherwise.

const NOTE = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0 }

// [note, beats]
const HAPPY_BIRTHDAY = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2], [null, 2],
]

const SOFT_ARP = [
  ['C5', 0.5], ['E5', 0.5], ['G5', 1], ['E5', 0.5], ['C5', 0.5], ['A4', 1],
  ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['C5', 0.5], ['A4', 0.5], ['F4', 1],
  ['G4', 0.5], ['B4', 0.5], ['D5', 1], ['B4', 0.5], ['G4', 0.5], ['E4', 1],
  ['C5', 0.5], ['D5', 0.5], ['E5', 1.5], ['C5', 1.5], [null, 1],
]

// Chords under each melody line, one per bar: [root notes...]
const HB_CHORDS = [['C4', 'E4', 'G4'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4'], ['F4', 'A4', 'C5']]
const ARP_CHORDS = [['C4', 'E4', 'G4'], ['A4', 'C5', 'E5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']]

let ctx = null
let master = null
let stopFlag = { stopped: false }

function ensureGraph() {
  if (ctx) return
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0.9

  // gentle echo for a dreamy music-box space
  const delay = ctx.createDelay()
  delay.delayTime.value = 0.31
  const feedback = ctx.createGain()
  feedback.gain.value = 0.28
  const wet = ctx.createGain()
  wet.gain.value = 0.22
  master.connect(delay)
  delay.connect(feedback).connect(delay)
  delay.connect(wet).connect(ctx.destination)
  master.connect(ctx.destination)
}

// Bell voice: sine fundamental + quiet detuned partial, fast attack, long soft decay.
function bell(freq, t, dur, vol = 0.16) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur * 1.9)
  gain.connect(master)

  const o1 = ctx.createOscillator()
  o1.type = 'sine'
  o1.frequency.value = freq
  const o2 = ctx.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = freq * 2.01 // slightly off octave = bell shimmer
  const g2 = ctx.createGain()
  g2.gain.value = 0.28
  o1.connect(gain)
  o2.connect(g2).connect(gain)
  o1.start(t); o1.stop(t + dur * 2)
  o2.start(t); o2.stop(t + dur * 2)
}

// Warm pad: soft triangle chord, slow attack, low volume.
function pad(freqs, t, dur) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.035, t + dur * 0.35)
  gain.gain.linearRampToValueAtTime(0.0001, t + dur)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  gain.connect(filter).connect(master)
  for (const f of freqs) {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = f / 2 // an octave down, warm
    o.connect(gain)
    o.start(t); o.stop(t + dur)
  }
}

function schedule(melody, chords, bpm, flag) {
  if (flag.stopped) return
  const beat = 60 / bpm
  let t = ctx.currentTime + 0.08
  const start = t
  let beatCount = 0
  for (const [name, beats] of melody) {
    if (name) bell(NOTE[name], t, beats * beat)
    t += beats * beat
    beatCount += beats
  }
  // pads: one chord per 4 beats
  const totalBeats = beatCount
  for (let b = 0; b < totalBeats; b += 4) {
    pad(chords[(b / 4) % chords.length].map((n) => NOTE[n]), start + b * beat, 4 * beat)
  }
  const totalMs = (t - ctx.currentTime) * 1000
  setTimeout(() => schedule(melody, chords, bpm, flag), totalMs + 600)
}

export function startMusic(occasion) {
  stopMusic()
  try {
    ensureGraph()
    if (ctx.state === 'suspended') ctx.resume()
    stopFlag = { stopped: false }
    if (occasion === 'birthday') schedule(HAPPY_BIRTHDAY, HB_CHORDS, 112, stopFlag)
    else schedule(SOFT_ARP, ARP_CHORDS, 84, stopFlag)
  } catch { /* audio unsupported — experience still works silently */ }
}

export function stopMusic() {
  stopFlag.stopped = true
}

// Short "pop!" — a burst of filtered noise, used when a balloon bursts.
export function popSound() {
  try {
    ensureGraph()
    if (ctx.state === 'suspended') ctx.resume()
    const dur = 0.09
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900
    filter.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.value = 0.5
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start()
  } catch { /* silent */ }
}

// Tiny WebAudio music box — no audio assets needed.
// Plays "Happy Birthday" for birthdays, a gentle looping arpeggio otherwise.

const NOTE = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 }

// [freq, beats]
const HAPPY_BIRTHDAY = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2], [null, 2],
]

const SOFT_ARP = [
  ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['C5', 0.5], ['G4', 0.5], ['E4', 0.5],
  ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 0.5], ['F4', 0.5],
  ['G4', 0.5], ['B4', 0.5], ['D5', 0.5], ['B4', 0.5], ['G4', 0.5], ['D4', 0.5],
  ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E5', 1.5], [null, 1],
]

let ctx = null
let stopFlag = { stopped: false }

function playNote(freq, t, dur, gainVal = 0.12) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(gainVal, t + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function schedule(melody, bpm, flag) {
  if (flag.stopped) return
  const beat = 60 / bpm
  let t = ctx.currentTime + 0.05
  for (const [name, beats] of melody) {
    if (name) {
      playNote(NOTE[name], t, beats * beat * 0.95)
      playNote(NOTE[name] / 2, t, beats * beat, 0.05) // soft bass octave
    }
    t += beats * beat
  }
  const total = (t - ctx.currentTime) * 1000
  setTimeout(() => schedule(melody, bpm, flag), total + 400)
}

export function startMusic(occasion) {
  stopMusic()
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    stopFlag = { stopped: false }
    if (occasion === 'birthday') schedule(HAPPY_BIRTHDAY, 130, stopFlag)
    else schedule(SOFT_ARP, 92, stopFlag)
  } catch { /* audio unsupported — experience still works silently */ }
}

export function stopMusic() {
  stopFlag.stopped = true
}

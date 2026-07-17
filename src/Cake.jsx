import React from 'react'

// Animated SVG cake; colors come from the selected cake flavour.
// Candles are individually tappable — `lit` is an array of booleans and
// tapping a flame calls onBlow(index).
export default function Cake({ colors, lit = [true, true, true], onBlow }) {
  const [c1, c2, c3] = colors
  return (
    <svg className="cake-svg" viewBox="0 0 300 260" width="260" height="225">
      <defs>
        <radialGradient id="flameGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 170, 60, 0.55)" />
          <stop offset="55%" stopColor="rgba(255, 140, 40, 0.22)" />
          <stop offset="100%" stopColor="rgba(255, 120, 20, 0)" />
        </radialGradient>
        <linearGradient id="flameBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffdd55" />
          <stop offset="45%" stopColor="#ffab24" />
          <stop offset="85%" stopColor="#ff7a1a" />
          <stop offset="100%" stopColor="#e85d04" />
        </linearGradient>
        <linearGradient id="flameCore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="70%" stopColor="#fff0a8" />
          <stop offset="100%" stopColor="#ffd166" />
        </linearGradient>
      </defs>
      {/* plate */}
      <ellipse cx="150" cy="240" rx="120" ry="14" fill="rgba(255,255,255,0.25)" />
      {/* bottom tier */}
      <rect x="55" y="170" width="190" height="66" rx="12" fill={c3} />
      <path d="M55 182 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 24 0 q12 16 22 0 V170 H55 Z" fill={c1} />
      {/* top tier */}
      <rect x="90" y="115" width="120" height="58" rx="10" fill={c2} />
      <path d="M90 126 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 q10 14 20 0 V115 H90 Z" fill={c1} />
      {/* candles */}
      {[120, 150, 180].map((x, i) => (
        <g key={x}>
          <rect x={x - 4} y="80" width="8" height="36" rx="3" fill={i % 2 ? '#fff' : '#ffd166'} />
          {lit[i] ? (
            <g
              className={`flame flame-${i}`}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => { e.stopPropagation(); onBlow?.(i) }}
            >
              {/* generous invisible hit area for small fingers */}
              <circle cx={x} cy="62" r="26" fill="transparent" />
              {/* warm glow halo */}
              <circle cx={x} cy="62" r="24" fill="url(#flameGlow)" />
              {/* teardrop flame body */}
              <path
                d={`M${x} 38 C ${x + 12} 54 ${x + 10} 68 ${x} 78 C ${x - 10} 68 ${x - 12} 54 ${x} 38`}
                fill="url(#flameBody)"
              />
              {/* bright inner core */}
              <path
                d={`M${x} 54 C ${x + 5} 63 ${x + 4.5} 70 ${x} 75 C ${x - 4.5} 70 ${x - 5} 63 ${x} 54`}
                fill="url(#flameCore)"
              />
              {/* blue base at the wick */}
              <ellipse cx={x} cy="77" rx="3.2" ry="2.4" fill="rgba(120,170,255,0.75)" />
            </g>
          ) : (
            <g className="smoke">
              <circle cx={x} cy="70" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx={x + 3} cy="62" r="2" fill="rgba(255,255,255,0.35)" />
              <circle cx={x - 2} cy="55" r="1.6" fill="rgba(255,255,255,0.25)" />
            </g>
          )}
        </g>
      ))}
      {/* cherries */}
      {[75, 150, 225].map((x) => (
        <circle key={x} cx={x} cy="168" r="7" fill="#e63946" />
      ))}
    </svg>
  )
}

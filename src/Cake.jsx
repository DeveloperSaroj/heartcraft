import React from 'react'

// Animated SVG cake; colors come from the selected cake flavour.
export default function Cake({ colors, lit = true }) {
  const [c1, c2, c3] = colors
  return (
    <svg className="cake-svg" viewBox="0 0 300 260" width="260" height="225">
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
          {lit && (
            <g className={`flame flame-${i}`}>
              <ellipse cx={x} cy="70" rx="6" ry="11" fill="#ffb703" />
              <ellipse cx={x} cy="72" rx="3" ry="6" fill="#fff3b0" />
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

import React, { useEffect, useState } from 'react'
import Wizard from './Wizard.jsx'
import Viewer from './Viewer.jsx'
import { decodeWish } from './encode.js'

// Hash routing: "#/view/<encoded>" plays the experience; anything else opens the creator.
function parseHash() {
  const m = window.location.hash.match(/^#\/view\/(.+)$/)
  return m ? decodeWish(m[1]) : null
}

export default function App() {
  const [viewWish, setViewWish] = useState(parseHash)

  useEffect(() => {
    const onHash = () => setViewWish(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return viewWish ? <Viewer wish={viewWish} /> : <Wizard />
}

export const OCCASIONS = [
  { id: 'birthday',    label: 'Birthday',    emoji: '🎂', tagline: 'Make their day unforgettable' },
  { id: 'anniversary', label: 'Anniversary', emoji: '💞', tagline: 'Celebrate your journey together' },
  { id: 'apology',     label: 'Apology',     emoji: '🥺', tagline: 'Say sorry from the heart' },
  { id: 'propose',     label: 'Propose',     emoji: '💍', tagline: 'Pop the question in style' },
]

export const CAKES = [
  { id: 'chocolate',  label: 'Chocolate Truffle', emoji: '🍫', colors: ['#5D4037', '#8D6E63', '#3E2723'] },
  { id: 'strawberry', label: 'Strawberry Cream',  emoji: '🍓', colors: ['#F8BBD0', '#F48FB1', '#EC407A'] },
  { id: 'vanilla',    label: 'Classic Vanilla',   emoji: '🍰', colors: ['#FFF3E0', '#FFE0B2', '#FFCC80'] },
  { id: 'blueberry',  label: 'Blueberry Blast',   emoji: '🫐', colors: ['#B3C7F7', '#7E9BE8', '#4A6FD4'] },
  { id: 'redvelvet',  label: 'Red Velvet',        emoji: '❤️', colors: ['#C62828', '#E53935', '#8E1B1B'] },
]

export const BONDS = [
  { id: 'friend',    label: 'Best Friend',      emoji: '🤝' },
  { id: 'love',      label: 'Love / Partner',   emoji: '💕' },
  { id: 'sibling',   label: 'Brother / Sister', emoji: '👫' },
  { id: 'parent',    label: 'Mom / Dad',        emoji: '👪' },
  { id: 'colleague', label: 'Colleague',        emoji: '💼' },
  { id: 'family',    label: 'Family',           emoji: '🏡' },
]

export const VIBES = [
  { id: 'dreamy',   label: 'Dreamy Pastel', emoji: '🌸', theme: { bg1: '#2b1b3d', bg2: '#7b4b94', accent: '#ffb7d5' } },
  { id: 'midnight', label: 'Midnight Glow', emoji: '🌌', theme: { bg1: '#0b1026', bg2: '#2c3e78', accent: '#8ec5ff' } },
  { id: 'sunset',   label: 'Golden Sunset', emoji: '🌇', theme: { bg1: '#3d1635', bg2: '#c94b4b', accent: '#ffd166' } },
  { id: 'garden',   label: 'Fresh Garden',  emoji: '🌿', theme: { bg1: '#0f2e1d', bg2: '#3e7c4f', accent: '#c6f7d0' } },
]

export const OCCASION_COPY = {
  birthday: {
    intro: (n) => `Hey ${n}...`,
    intro2: 'Someone made something special for you 🎁',
    headline: (n) => `Happy Birthday, ${n}! 🎉`,
    cakeLine: 'Make a wish & blow the candles...',
    finale: 'Wishing you the happiest year yet! 🥳',
  },
  anniversary: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'A little celebration of us 💞',
    headline: (n) => `Happy Anniversary, ${n}! 💐`,
    cakeLine: 'Sweetness for our sweetest journey...',
    finale: 'Here’s to many more years together 🥂',
  },
  apology: {
    intro: (n) => `${n}...`,
    intro2: 'There’s something I need to say 🥺',
    headline: (n) => `I’m truly sorry, ${n} 💔`,
    cakeLine: 'A little sweetness to soften things...',
    finale: 'Please forgive me? 🙏💐',
  },
  propose: {
    intro: (n) => `${n}...`,
    intro2: 'I’ve been wanting to ask you something 💭',
    headline: (n) => `${n}, will you be mine? 💍`,
    cakeLine: 'Sweet moments start with sweet things...',
    finale: 'Will you say yes? 💖',
  },
}

export const byId = (list, id) => list.find((x) => x.id === id) || list[0]

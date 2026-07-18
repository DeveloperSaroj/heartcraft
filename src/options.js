export const OCCASIONS = [
  { id: 'birthday',    label: 'Birthday',        emoji: '🎂', tagline: 'Make their day unforgettable' },
  { id: 'anniversary', label: 'Anniversary',     emoji: '💞', tagline: 'Celebrate your journey together' },
  { id: 'apology',     label: 'Apology',         emoji: '🥺', tagline: 'Say sorry from the heart' },
  { id: 'propose',     label: 'Propose',         emoji: '💍', tagline: 'Pop the question in style' },
  { id: 'missyou',     label: 'Miss You',        emoji: '🫂', tagline: 'Say “I miss you” across the miles' },
  { id: 'mothersday',  label: 'Mother’s Day',    emoji: '🌷', tagline: 'For the world’s best mom' },
  { id: 'fathersday',  label: 'Father’s Day',    emoji: '🦸', tagline: 'For your first superhero' },
  { id: 'rakhi',       label: 'Raksha Bandhan',  emoji: '🪢', tagline: 'A bond beyond words' },
  { id: 'diwali',      label: 'Diwali',          emoji: '🪔', tagline: 'Light up their festival' },
  { id: 'farewell',    label: 'Farewell',        emoji: '👋', tagline: 'Goodbyes done beautifully' },
  { id: 'congrats',    label: 'Congratulations', emoji: '🏆', tagline: 'Cheer their big win' },
  { id: 'getwell',     label: 'Get Well Soon',   emoji: '🤗', tagline: 'Send healing hugs' },
]

export const CAKES = [
  { id: 'chocolate',  label: 'Chocolate Truffle', emoji: '🍫', colors: ['#5D4037', '#8D6E63', '#3E2723'] },
  { id: 'strawberry', label: 'Strawberry Cream',  emoji: '🍓', colors: ['#F8BBD0', '#F48FB1', '#EC407A'] },
  { id: 'vanilla',    label: 'Classic Vanilla',   emoji: '🍰', colors: ['#FFF3E0', '#FFE0B2', '#FFCC80'] },
  { id: 'blueberry',  label: 'Blueberry Blast',   emoji: '🫐', colors: ['#B3C7F7', '#7E9BE8', '#4A6FD4'] },
  { id: 'redvelvet',  label: 'Red Velvet',        emoji: '❤️', colors: ['#C62828', '#E53935', '#8E1B1B'] },
  { id: 'butterscotch', label: 'Butterscotch',    emoji: '🍯', colors: ['#F6E3B4', '#E9C46A', '#B9862F'] },
  { id: 'chhenapoda',   label: 'Chhenapoda',      emoji: '🧀', colors: ['#E8C170', '#C68A3E', '#7A4A1E'] },
  { id: 'rasagola',     label: 'Rasagola',        emoji: '⚪', colors: ['#FFFDF6', '#FFF6DC', '#F0E3B8'] },
  { id: 'rasmalai',     label: 'Rasmalai',        emoji: '🥛', colors: ['#FFF8EC', '#FCE9C6', '#F3D08A'] },
]

export const BONDS = [
  { id: 'friend',    label: 'Best Friend',      emoji: '🤝' },
  { id: 'love',      label: 'Love / Partner',   emoji: '💕' },
  { id: 'sibling',   label: 'Brother / Sister', emoji: '👫' },
  { id: 'parent',    label: 'Mom / Dad',        emoji: '👪' },
  { id: 'colleague', label: 'Colleague',        emoji: '💼' },
  { id: 'family',    label: 'Family',           emoji: '🏡' },
]

// Brand pinks & purples, plus nature moods with live weather effects.
export const VIBES = [
  { id: 'dreamy',   label: 'Dreamy Pink',    emoji: '🌸', theme: { bg1: '#3b0f35', bg2: '#c2379b', accent: '#ffc2dd' } },
  { id: 'midnight', label: 'Royal Purple',   emoji: '🌌', theme: { bg1: '#1d0a3d', bg2: '#6a2fc4', accent: '#ff8ec5' } },
  { id: 'sunset',   label: 'Berry Sunset',   emoji: '🌇', theme: { bg1: '#42082e', bg2: '#e0447e', accent: '#ffd166' } },
  { id: 'garden',   label: 'Orchid Glow',    emoji: '🪻', theme: { bg1: '#2a0f4a', bg2: '#9b4dcc', accent: '#f7c6ff' } },
  { id: 'rain',     label: 'Gentle Rain',    emoji: '🌧️', theme: { bg1: '#0f2036', bg2: '#3c6591', accent: '#bcd9ff' } },
  { id: 'thunder',  label: 'Thunderstorm',   emoji: '⛈️', theme: { bg1: '#0a0d1c', bg2: '#333d5c', accent: '#ffe28a' } },
  { id: 'desert',   label: 'Golden Desert',  emoji: '🏜️', theme: { bg1: '#3f1f0b', bg2: '#c07a35', accent: '#ffd9a0' } },
  { id: 'sea',      label: 'Deep Sea',       emoji: '🌊', theme: { bg1: '#04222c', bg2: '#12768f', accent: '#a8f0ff' } },
  { id: 'mountain', label: 'Sea & Mountains',emoji: '🏔️', theme: { bg1: '#141031', bg2: '#45397a', accent: '#cdc4ff' } },
]

export const OCCASION_COPY = {
  birthday: {
    intro: (n) => `Hey ${n}...`,
    intro2: 'Someone made something special for you 🎁',
    headline: (n) => `Happy Birthday, ${n}! 🎉`,
    cakeLine: 'Make a wish & blow out the candles...',
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
  mothersday: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'The one who gave me everything 🌷',
    headline: (n) => `Happy Mother’s Day, ${n}! 💐`,
    cakeLine: 'Something sweet, for the sweetest mom...',
    finale: 'Thank you for everything, Maa ❤️',
  },
  fathersday: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'My first hero, always 🦸',
    headline: (n) => `Happy Father’s Day, ${n}! 🎖️`,
    cakeLine: 'A treat for the strongest shoulders...',
    finale: 'Thank you for being my hero, Papa ❤️',
  },
  rakhi: {
    intro: (n) => `Hey ${n}...`,
    intro2: 'A thread that ties our hearts 🪢',
    headline: (n) => `Happy Raksha Bandhan, ${n}! 🎊`,
    cakeLine: 'Sweets first — that’s the rule!',
    finale: 'Forever partners in crime 👫💕',
  },
  diwali: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'May your world glow tonight 🪔',
    headline: (n) => `Happy Diwali, ${n}! ✨`,
    cakeLine: 'Festival calories don’t count...',
    finale: 'Wishing you light, luck & laddoos 🪔✨',
  },
  newyear: {
    intro: (n) => `Hey ${n}...`,
    intro2: 'A brand new chapter begins 🎆',
    headline: (n) => `Happy New Year, ${n}! 🥂`,
    cakeLine: 'Starting the year on a sweet note...',
    finale: 'May this year be your best one yet 🎇',
  },
  farewell: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'Some goodbyes deserve more than words 👋',
    headline: (n) => `Farewell, ${n} 🌟`,
    cakeLine: 'One last sweet memory together...',
    finale: 'Not goodbye — just see you later 🤍',
  },
  congrats: {
    intro: (n) => `Hey ${n}...`,
    intro2: 'Someone is SO proud of you 🏆',
    headline: (n) => `Congratulations, ${n}! 🎊`,
    cakeLine: 'Big wins deserve big cakes...',
    finale: 'You earned every bit of this! 🥳',
  },
  getwell: {
    intro: (n) => `Dear ${n}...`,
    intro2: 'Sending you a little sunshine ☀️',
    headline: (n) => `Get well soon, ${n}! 🤗`,
    cakeLine: 'Sweetness is the best medicine...',
    finale: 'Rest up — the world needs your smile 💛',
  },
  missyou: {
    intro: (n) => `${n}...`,
    intro2: 'Distance is just a test of how far love can travel 🤍',
    headline: (n) => `I miss you, ${n} 🫂`,
    cakeLine: '',
    finale: 'Come back soon — I’ll be right here 🤍',
  },
}

// Gift-box mini messages: 3 shown, recipient picks one.
export const BOX_MESSAGES = (name) => [
  `${name}, you are someone’s favourite person 🥹`,
  `Amount of love packed in here: ∞ 💝`,
  `A warm hug is loading for you... 🤗`,
]

// One-tap letter starters, by mood.
export const LETTER_TEMPLATES = [
  {
    id: 'heartfelt', label: 'Heartfelt', emoji: '💖',
    text: (n) => `Dear ${n},\nSome people make the world softer just by being in it — you are one of them. I don’t say it often enough, but you mean the world to me. Today, I just wanted you to feel as special as you make everyone else feel.\nWith all my heart.`,
  },
  {
    id: 'funny', label: 'Funny', emoji: '😄',
    text: (n) => `Dear ${n},\nScientists confirmed it: people who receive this letter become 87% more awesome (you were already at 99%, so careful).\nJokes apart — you’re my favourite notification, my favourite person, my favourite everything. Don’t let it get to your head. Okay, let it. 😌`,
  },
  {
    id: 'short', label: 'Short & Sweet', emoji: '🍬',
    text: (n) => `${n},\nYou. Are. Loved.\nToday, tomorrow, always. 💗`,
  },
  {
    id: 'poetic', label: 'Poetic', emoji: '🪶',
    text: (n) => `Dear ${n},\nIf feelings were colours, today would be painted in your favourite one.\nIf moments were flowers, I’d gift you a garden.\nBut all I have are these small words, carrying something enormous:\nyou matter, more than you know.`,
  },
]

// Light-touch content filter — enough to stop casual misuse.
const BAD_WORDS = ['fuck', 'bitch', 'bastard', 'asshole', 'chutiya', 'bhosdi', 'madarchod', 'behenchod', 'randi']
export function findBadWord(text) {
  const t = (text || '').toLowerCase()
  return BAD_WORDS.find((w) => t.includes(w)) || null
}

export const byId = (list, id) => list.find((x) => x.id === id) || list[0]

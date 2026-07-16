import { useEffect, useMemo, useRef, useState } from 'react'
import './spot-difference.css'

type SpotDifferenceProps = { onBack: () => void }
type Difficulty = 'easy' | 'medium' | 'hard'
type Difference = { id: string; label: string; x: number; y: number; size: number; art: string; kind?: string }

const EASY_DIFFERENCES: Difference[] = [
  { id: 'star', label: '多了一颗星星', x: 69, y: 18, size: 10, art: '★' },
  { id: 'bow', label: '小兔子戴上了蝴蝶结', x: 62, y: 49, size: 11, art: '🎀' },
  { id: 'apple', label: '野餐布上多了一个苹果', x: 57, y: 78, size: 11, art: '●' },
  { id: 'flower', label: '花朵变成了黄色', x: 88, y: 63, size: 11, art: '✿' },
  { id: 'mushroom', label: '蘑菇上多了蓝色斑点', x: 10, y: 68, size: 12, art: '•••' },
  { id: 'moon-star', label: '月亮旁边多了一颗小星星', x: 75, y: 9, size: 9, art: '✦' },
  { id: 'castle-flag', label: '城堡上多了一面旗子', x: 80, y: 31, size: 9, art: '⚑' },
  { id: 'butterfly', label: '多了一只蓝色蝴蝶', x: 88, y: 42, size: 11, art: '◆' },
  { id: 'lantern', label: '灯笼变成了蓝色', x: 74, y: 76, size: 12, art: '●' },
  { id: 'basket', label: '篮子上多了蓝色蝴蝶结', x: 25, y: 72, size: 12, art: '◆' },
  { id: 'dress-star', label: 'Luna 的裙子上多了一颗星星', x: 41, y: 66, size: 10, art: '★' },
  { id: 'rabbit-ear', label: '兔子耳朵上多了一块紫色', x: 61, y: 43, size: 9, art: '●' },
  { id: 'firefly', label: '树下多了一只萤火虫', x: 16, y: 48, size: 9, art: '✦' },
  { id: 'blanket', label: '野餐布上多了一个蓝色方块', x: 52, y: 87, size: 10, art: '■' },
  { id: 'purple-flower', label: '右下角多了一朵蓝色花', x: 92, y: 82, size: 11, art: '✿' },
] 

const MEDIUM_DIFFERENCES: Difference[] = [
  { id: 'm-bubble', label: '多了一个大泡泡', x: 25, y: 13, size: 8, art: '○', kind: 'bubble' },
  { id: 'm-fish', label: '小鱼变成了紫色', x: 12, y: 16, size: 9, art: '◆', kind: 'fish' },
  { id: 'm-ship', label: '沉船上多了一面旗子', x: 13, y: 45, size: 9, art: '⚑', kind: 'flag' },
  { id: 'm-luna', label: 'Luna 身上多了一颗星星', x: 33, y: 53, size: 9, art: '★', kind: 'gold-star' },
  { id: 'm-turtle', label: '海龟戴上了蝴蝶结', x: 58, y: 39, size: 10, art: '🎀', kind: 'bow' },
  { id: 'm-palace', label: '宫殿上多了一面小旗', x: 79, y: 16, size: 8, art: '⚑', kind: 'pink-flag' },
  { id: 'm-bluefish', label: '蓝色小鱼多了一颗心', x: 86, y: 38, size: 9, art: '♥', kind: 'heart' },
  { id: 'm-octopus', label: '章鱼戴上了帽子', x: 83, y: 57, size: 10, art: '▲', kind: 'hat' },
  { id: 'm-chest', label: '宝箱里多了一颗蓝宝石', x: 43, y: 82, size: 9, art: '◆', kind: 'gem' },
  { id: 'm-shell', label: '贝壳里的珍珠变蓝了', x: 21, y: 84, size: 10, art: '●', kind: 'blue-pearl' },
  { id: 'm-starfish', label: '海星变成了绿色', x: 74, y: 88, size: 10, art: '★', kind: 'green-star' },
  { id: 'm-coral', label: '珊瑚上多了一朵黄花', x: 6, y: 69, size: 9, art: '✿', kind: 'yellow-flower' },
  { id: 'm-pearl', label: '沙地上多了一颗珍珠', x: 58, y: 91, size: 8, art: '●', kind: 'pearl' },
  { id: 'm-seaweed', label: '右边多了一片黄色海草', x: 94, y: 29, size: 9, art: '❯', kind: 'seaweed' },
]

const HARD_DIFFERENCES: Difference[] = [
  { id: 'h-planet', label: '紫色星球多了一个环', x: 9, y: 11, size: 8, art: '—', kind: 'planet-ring' },
  { id: 'h-comet', label: '多了一颗蓝色彗星', x: 29, y: 11, size: 8, art: '✦', kind: 'blue-comet' },
  { id: 'h-saturn', label: '土星上多了一颗星星', x: 54, y: 11, size: 8, art: '★', kind: 'gold-star' },
  { id: 'h-station', label: '空间站多了一面旗子', x: 77, y: 9, size: 8, art: '⚑', kind: 'pink-flag' },
  { id: 'h-blueplanet', label: '蓝色星球变成了绿色', x: 94, y: 8, size: 8, art: '●', kind: 'green-planet' },
  { id: 'h-flag', label: '左边旗子变成了黄色', x: 9, y: 33, size: 8, art: '★', kind: 'yellow-flag' },
  { id: 'h-luna', label: 'Luna 头盔上多了一颗心', x: 28, y: 40, size: 8, art: '♥', kind: 'heart' },
  { id: 'h-rover', label: '月球车多了一盏蓝灯', x: 44, y: 48, size: 8, art: '●', kind: 'blue-light' },
  { id: 'h-base', label: '太空基地门上多了一颗星', x: 68, y: 47, size: 8, art: '★', kind: 'gold-star' },
  { id: 'h-rocket', label: '火箭窗户变成了绿色', x: 91, y: 34, size: 8, art: '●', kind: 'green-window' },
  { id: 'h-crystal-left', label: '左边多了一颗黄色水晶', x: 8, y: 81, size: 8, art: '♦', kind: 'yellow-crystal' },
  { id: 'h-robot', label: '机器人头上多了一根天线', x: 41, y: 68, size: 8, art: '●', kind: 'antenna' },
  { id: 'h-pink-alien', label: '粉色外星人戴上了蝴蝶结', x: 61, y: 63, size: 8, art: '🎀', kind: 'bow' },
  { id: 'h-yellow-alien', label: '黄色外星人多了一颗心', x: 78, y: 67, size: 8, art: '♥', kind: 'heart' },
  { id: 'h-blue-alien', label: '蓝色外星人戴上了帽子', x: 89, y: 69, size: 8, art: '▲', kind: 'hat' },
  { id: 'h-crater', label: '中间陨石坑里多了一颗星', x: 58, y: 87, size: 9, art: '★', kind: 'gold-star' },
  { id: 'h-flower', label: '右下角花朵变成了蓝色', x: 90, y: 90, size: 9, art: '✿', kind: 'blue-flower' },
  { id: 'h-crystal', label: '紫色水晶中多了一颗绿色水晶', x: 70, y: 75, size: 8, art: '♦', kind: 'green-crystal' },
]

const LEVELS = {
  easy: { name: '简单', count: 5, title: '月亮森林野餐', image: '/games/spot-difference/moonlight-picnic.jpg', differences: EASY_DIFFERENCES, spacing: 11 },
  medium: { name: '中等', count: 8, title: '海底寻宝', image: '/games/spot-difference/underwater-treasure.jpg', differences: MEDIUM_DIFFERENCES, spacing: 7 },
  hard: { name: '困难', count: 12, title: '太空星球探险', image: '/games/spot-difference/space-adventure.jpg', differences: HARD_DIFFERENCES, spacing: 4 },
} satisfies Record<Difficulty, { name: string; count: number; title: string; image: string; differences: Difference[]; spacing: number }>

const RECENT_ROUNDS_KEY = 'luna-spot-difference-recent-rounds'

const seededRandom = (seed: number) => {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

const idsForSeed = (seed: number, difficulty: Difficulty) => {
  const level = LEVELS[difficulty]
  const random = seededRandom(seed)
  const shuffled = [...level.differences]
    .map((difference) => ({ difference, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ difference }) => difference)

  const picked: Difference[] = []
  for (const difference of shuffled) {
    const hasSpace = picked.every((other) => {
      const dx = difference.x - other.x
      const dy = (difference.y - other.y) * 1.35
      return Math.hypot(dx, dy) > level.spacing
    })
    if (hasSpace) picked.push(difference)
    if (picked.length === level.count) break
  }
  return picked
    .map((difference) => difference.id)
    .sort()
}

const createRoundSeed = (difficulty: Difficulty) => {
  let recent: string[] = []
  try { recent = JSON.parse(localStorage.getItem(RECENT_ROUNDS_KEY) ?? '[]') as string[] } catch { /* Start with no history. */ }

  let seed = Date.now()
  let ids = idsForSeed(seed, difficulty)
  let key = `${difficulty}:${ids.join('|')}`
  while (recent.includes(key)) {
    seed += 1
    ids = idsForSeed(seed, difficulty)
    key = `${difficulty}:${ids.join('|')}`
  }
  try { localStorage.setItem(RECENT_ROUNDS_KEY, JSON.stringify([key, ...recent].slice(0, 8))) } catch { /* Play without history in private mode. */ }
  return seed
}

function SpotDifference({ onBack }: SpotDifferenceProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [roundSeed, setRoundSeed] = useState(() => createRoundSeed('easy'))
  const [found, setFound] = useState<string[]>([])
  const [hinted, setHinted] = useState<string | null>(null)
  const [wrongPanel, setWrongPanel] = useState<string | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const level = LEVELS[difficulty]
  const activeIds = useMemo(() => idsForSeed(roundSeed, difficulty), [roundSeed, difficulty])
  const activeDifferences = useMemo(
    () => level.differences.filter((difference) => activeIds.includes(difference.id)),
    [activeIds, level.differences],
  )
  const complete = found.length === level.count

  const playChime = (completeSound = false) => {
    const AudioCtx = window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const context = audioRef.current ?? new AudioCtx()
    audioRef.current = context
    void context.resume()
    const notes = completeSound ? [523, 659, 784, 1047] : [660, 880]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime + index * .11
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(.001, start)
      gain.gain.linearRampToValueAtTime(.07, start + .015)
      gain.gain.exponentialRampToValueAtTime(.001, start + .25)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + .26)
    })
  }

  const findDifference = (id: string) => {
    if (found.includes(id)) return
    const next = [...found, id]
    setFound(next)
    setHinted(null)
    playChime(next.length === level.count)
  }

  const handleMiss = (panel: string) => {
    setWrongPanel(panel)
    window.setTimeout(() => setWrongPanel(null), 380)
  }

  const showHint = () => {
    const next = activeDifferences.find((difference) => !found.includes(difference.id))
    if (!next) return
    setHinted(next.id)
    window.setTimeout(() => setHinted(null), 1800)
  }

  useEffect(() => () => { void audioRef.current?.close() }, [])

  const changeDifficulty = (nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty)
    setFound([])
    setHinted(null)
    setRoundSeed(createRoundSeed(nextDifficulty))
  }

  return (
    <main className="spot-game">
      {complete && <div className="spot-celebration" aria-hidden="true">★ ✦ ★ ✧ ★</div>}
      <header className="spot-header">
        <button type="button" className="spot-back" onClick={onBack}>‹ <span>游戏大厅</span></button>
        <div className="spot-title"><span>🔎</span><div><strong>找不同</strong><small>{level.title}</small></div></div>
        <button type="button" className="hint-button" onClick={showHint} disabled={complete}>💡 <span>提示</span></button>
      </header>

      <section className="spot-toolbar">
        <div className="difficulty-tabs" aria-label="游戏难度">
          {(Object.keys(LEVELS) as Difficulty[]).map((key) => (
            <button type="button" className={difficulty === key ? 'active' : ''} onClick={() => changeDifficulty(key)} key={key}>
              {LEVELS[key].name} <small>{LEVELS[key].count}处</small>
            </button>
          ))}
        </div>
        <div className="spot-progress" aria-live="polite">
          {complete ? <strong>Luna 全部找到啦！</strong> : <><span>{found.length}</span> / {level.count} 已找到</>}
        </div>
      </section>

      <section className="picture-pair">
        {(['original', 'different'] as const).map((panel, panelIndex) => (
          <article className={`picture-card ${wrongPanel === panel ? 'miss' : ''}`} key={panel}>
            <div className="picture-label">图片 {panelIndex + 1}</div>
            <div className="scene" onClick={() => handleMiss(panel)}>
              <img src={level.image} alt={`${level.title}图片 ${panelIndex + 1}`} draggable="false" />
              {panel === 'different' && activeDifferences.map((difference) => (
                <span
                  key={difference.id}
                  className={`difference-art art-${difference.kind ?? difference.id}`}
                  style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                >{difference.art}</span>
              ))}
              {activeDifferences.map((difference) => (
                <button
                  type="button"
                  key={difference.id}
                  className={`hit-area ${found.includes(difference.id) ? 'found' : ''} ${hinted === difference.id ? 'hinted' : ''}`}
                  style={{ left: `${difference.x}%`, top: `${difference.y}%`, width: `${difference.size}%` }}
                  onClick={(event) => { event.stopPropagation(); findDifference(difference.id) }}
                  aria-label={found.includes(difference.id) ? `已找到：${difference.label}` : '可能的不同之处'}
                ><span>✓</span></button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="spot-footer">
        <p>{complete ? '你有一双亮晶晶的眼睛！' : `两张图片有 ${level.count} 处不同，点一点你发现的地方吧！`}</p>
        <button type="button" onClick={() => { setFound([]); setHinted(null); setRoundSeed(createRoundSeed(difficulty)) }}>↻ 换一关</button>
      </footer>
    </main>
  )
}

export default SpotDifference

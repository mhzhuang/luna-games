import { useEffect, useRef, useState } from 'react'
import './spot-difference.css'

type SpotDifferenceProps = { onBack: () => void }

const DIFFERENCES = [
  { id: 'star', label: '多了一颗星星', x: 69, y: 18, size: 10, art: '★' },
  { id: 'bow', label: '小兔子戴上了蝴蝶结', x: 62, y: 49, size: 11, art: '🎀' },
  { id: 'apple', label: '野餐布上多了一个苹果', x: 57, y: 78, size: 11, art: '●' },
  { id: 'flower', label: '花朵变成了黄色', x: 88, y: 63, size: 11, art: '✿' },
  { id: 'mushroom', label: '蘑菇上多了蓝色斑点', x: 10, y: 68, size: 12, art: '•••' },
] as const

function SpotDifference({ onBack }: SpotDifferenceProps) {
  const [found, setFound] = useState<string[]>([])
  const [hinted, setHinted] = useState<string | null>(null)
  const [wrongPanel, setWrongPanel] = useState<string | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const complete = found.length === DIFFERENCES.length

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
    playChime(next.length === DIFFERENCES.length)
  }

  const handleMiss = (panel: string) => {
    setWrongPanel(panel)
    window.setTimeout(() => setWrongPanel(null), 380)
  }

  const showHint = () => {
    const next = DIFFERENCES.find((difference) => !found.includes(difference.id))
    if (!next) return
    setHinted(next.id)
    window.setTimeout(() => setHinted(null), 1800)
  }

  useEffect(() => () => { void audioRef.current?.close() }, [])

  return (
    <main className="spot-game">
      {complete && <div className="spot-celebration" aria-hidden="true">★ ✦ ★ ✧ ★</div>}
      <header className="spot-header">
        <button type="button" className="spot-back" onClick={onBack}>‹ <span>游戏大厅</span></button>
        <div className="spot-title"><span>🔎</span><div><strong>找不同</strong><small>月亮森林野餐</small></div></div>
        <button type="button" className="hint-button" onClick={showHint} disabled={complete}>💡 <span>提示</span></button>
      </header>

      <section className="spot-toolbar">
        <div className="difficulty-tabs" aria-label="游戏难度">
          <button type="button" className="active">简单 <small>5处</small></button>
          <button type="button" disabled>中等 <small>8处</small></button>
          <button type="button" disabled>困难 <small>12处</small></button>
        </div>
        <div className="spot-progress" aria-live="polite">
          {complete ? <strong>Luna 全部找到啦！</strong> : <><span>{found.length}</span> / 5 已找到</>}
        </div>
      </section>

      <section className="picture-pair">
        {(['original', 'different'] as const).map((panel, panelIndex) => (
          <article className={`picture-card ${wrongPanel === panel ? 'miss' : ''}`} key={panel}>
            <div className="picture-label">图片 {panelIndex + 1}</div>
            <div className="scene" onClick={() => handleMiss(panel)}>
              <img src="/games/spot-difference/moonlight-picnic.jpg" alt={`月亮森林野餐图片 ${panelIndex + 1}`} draggable="false" />
              {panel === 'different' && DIFFERENCES.map((difference) => (
                <span
                  key={difference.id}
                  className={`difference-art art-${difference.id}`}
                  style={{ left: `${difference.x}%`, top: `${difference.y}%` }}
                >{difference.art}</span>
              ))}
              {DIFFERENCES.map((difference) => (
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
        <p>{complete ? '你有一双亮晶晶的眼睛！' : '两张图片有 5 处不同，点一点你发现的地方吧！'}</p>
        <button type="button" onClick={() => { setFound([]); setHinted(null) }}>↻ 重新开始</button>
      </footer>
    </main>
  )
}

export default SpotDifference

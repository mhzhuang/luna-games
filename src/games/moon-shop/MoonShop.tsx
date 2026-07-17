import { useEffect, useRef, useState } from 'react'
import './moon-shop.css'

type MoonShopProps = { onBack: () => void }
type Mode = 'add' | 'subtract' | 'mixed'
type Question = { a: number; b: number; operation: '+' | '-'; answer: number; item: string; emoji: string }

const ITEMS = [
  ['小兔玩偶', '🐰'], ['月亮灯', '🌙'], ['彩虹风车', '🌈'], ['星星饼干', '🍪'],
  ['小熊背包', '🎒'], ['太空火箭', '🚀'], ['魔法花朵', '🌸'], ['蓝色气球', '🎈'],
] as const

const chineseNumber = (value: number) => {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value < 10) return digits[value]
  if (value === 100) return '一百'
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return `${tens === 1 ? '' : digits[tens]}十${ones ? digits[ones] : ''}`
}

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const makeQuestion = (mode: Mode, index: number): Question => {
  const operation = mode === 'mixed' ? (index % 2 === 0 ? '+' : '-') : mode === 'add' ? '+' : '-'
  const [item, emoji] = ITEMS[Math.floor(Math.random() * ITEMS.length)]

  if (operation === '+') {
    for (;;) {
      const a = randomBetween(12, 68)
      const b = randomBetween(11, 48)
      if (a + b <= 99 && a % 10 + b % 10 >= 10) return { a, b, operation, answer: a + b, item, emoji }
    }
  }

  for (;;) {
    const a = randomBetween(31, 98)
    const b = randomBetween(12, a - 1)
    if (a % 10 < b % 10) return { a, b, operation, answer: a - b, item, emoji }
  }
}

function MoonShop({ onBack }: MoonShopProps) {
  const [mode, setMode] = useState<Mode>('mixed')
  const [started, setStarted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState(() => makeQuestion('mixed', 0))
  const [answerTens, setAnswerTens] = useState(0)
  const [answerOnes, setAnswerOnes] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [complete, setComplete] = useState(false)
  const [chineseVoices, setChineseVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState(() => {
    try { return localStorage.getItem('luna-math-voice') ?? '' } catch { return '' }
  })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const questionSpeech = (current = question) => current.operation === '+'
    ? `${current.item}要${chineseNumber(current.a)}颗星星币，另一件礼物要${chineseNumber(current.b)}颗。一共需要多少颗星星币呢？`
    : `小兔有${chineseNumber(current.a)}颗星星币，买${current.item}花了${chineseNumber(current.b)}颗。还剩多少颗呢？`

  const speak = (text: string) => {
    if (!soundOn || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = .95
    utterance.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find((voice) => voice.name === voiceName)
      ?? voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn' && voice.localService)
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('zh-cn'))
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('zh'))
      ?? null
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('zh'))
      setChineseVoices(voices)
      if (!voiceName && voices.length) {
        const preferred = voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn' && voice.localService)
          ?? voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn')
          ?? voices[0]
        setVoiceName(preferred.name)
      }
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.cancel()
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [voiceName])

  const chooseVoice = (name: string) => {
    setVoiceName(name)
    try { localStorage.setItem('luna-math-voice', name) } catch { /* Continue without saving preferences. */ }
  }

  const resetAnswer = () => {
    setAnswerTens(0)
    setAnswerOnes(0)
    setFeedback(null)
    setShowHint(false)
  }

  const startGame = () => {
    const firstQuestion = makeQuestion(mode, 0)
    setQuestion(firstQuestion)
    setQuestionIndex(0)
    setStarted(true)
    setComplete(false)
    resetAnswer()
    speak(`欢迎来到 Luna 的月亮商店！今天我们来帮小动物买东西吧。${questionSpeech(firstQuestion)}`)
  }

  const checkAnswer = () => {
    const value = answerTens * 10 + answerOnes
    if (value === question.answer) {
      setFeedback('correct')
      speak(`太棒了！答案是${chineseNumber(question.answer)}。你算对啦！`)
    } else {
      setFeedback('try-again')
      speak('很接近啦。数一数月亮币和小星星，我们再试一次。')
    }
  }

  const nextQuestion = () => {
    if (questionIndex === 4) {
      setComplete(true)
      speak('今天的五位客人都买到东西啦！Luna 是最棒的月亮商店老板！')
      return
    }
    const nextIndex = questionIndex + 1
    const next = makeQuestion(mode, nextIndex)
    setQuestionIndex(nextIndex)
    setQuestion(next)
    resetAnswer()
    window.setTimeout(() => speak(questionSpeech(next)), 120)
  }

  const giveHint = () => {
    setShowHint(true)
    if (question.operation === '+') {
      speak(`${chineseNumber(question.a % 10)}颗小星星加${chineseNumber(question.b % 10)}颗小星星，超过十颗啦。把十颗装进袋子，换成一枚月亮币。`)
    } else {
      speak(`${chineseNumber(question.a % 10)}颗小星星不够减。拆开一枚月亮币，就会得到十颗小星星。`)
    }
  }

  if (!started) {
    return (
      <main className="shop-game shop-welcome">
        <button type="button" className="shop-back" onClick={onBack}>‹ 游戏大厅</button>
        <section className="welcome-shop-card">
          <div className="shop-sign"><span>☾</span><strong>Luna 的月亮商店</strong><small>用星星币帮小动物买礼物吧！</small></div>
          <div className="shop-window" aria-hidden="true"><span>🐰</span><span>🌙</span><span>🚀</span><span>🎈</span></div>
          <div className="mode-picker">
            <p>今天想练习什么？</p>
            <div>
              <button type="button" className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>加法 ＋</button>
              <button type="button" className={mode === 'subtract' ? 'active' : ''} onClick={() => setMode('subtract')}>减法 −</button>
              <button type="button" className={mode === 'mixed' ? 'active' : ''} onClick={() => setMode('mixed')}>加减混合 ✦</button>
            </div>
          </div>
          <div className="voice-picker">
            <label htmlFor="math-voice">🔊 选择讲题声音</label>
            <select id="math-voice" value={voiceName} onChange={(event) => chooseVoice(event.target.value)}>
              {chineseVoices.length === 0 && <option value="">系统普通话</option>}
              {chineseVoices.map((voice) => <option value={voice.name} key={`${voice.name}-${voice.lang}`}>{voice.name}（{voice.lang}）</option>)}
            </select>
            <button type="button" onClick={() => speak('你好 Luna，欢迎来到月亮商店！我们一起快乐地学数学吧。')}>试听</button>
          </div>
          <button type="button" className="open-shop-button" onClick={startGame}>🔊 开始营业</button>
        </section>
      </main>
    )
  }

  return (
    <main className="shop-game">
      {complete && <div className="shop-celebration" aria-hidden="true">★ 🐰 ★ 🌙 ★</div>}
      <header className="shop-header">
        <button type="button" className="shop-back" onClick={onBack}>‹ <span>游戏大厅</span></button>
        <div className="shop-title"><span>☾</span><div><strong>月亮商店</strong><small>{mode === 'mixed' ? '加减混合' : mode === 'add' ? '进位加法' : '退位减法'}</small></div></div>
        <button type="button" className="shop-sound" onClick={() => { setSoundOn(!soundOn); if (soundOn) window.speechSynthesis.cancel() }}>{soundOn ? '🔊' : '🔇'}</button>
      </header>

      <section className="shop-progress" aria-label="答题进度">
        {Array.from({ length: 5 }, (_, index) => <i key={index} className={index < questionIndex || feedback === 'correct' && index === questionIndex ? 'done' : index === questionIndex ? 'current' : ''}>★</i>)}
      </section>

      {complete ? (
        <section className="shop-complete-card">
          <div>🏆</div><h1>商店营业成功！</h1><p>Luna 获得了月亮店长奖章</p>
          <button type="button" onClick={startGame}>再玩一轮</button><button type="button" onClick={onBack}>返回大厅</button>
        </section>
      ) : (
        <section className="shop-content">
          <article className="customer-card">
            <div className="customer">🐰</div>
            <div className="speech-bubble">
              <button type="button" onClick={() => speak(questionSpeech())} aria-label="重听题目">🔊</button>
              <p>{question.operation === '+'
                ? <>{question.item}需要 <b>{question.a}</b> 颗，另一件礼物需要 <b>{question.b}</b> 颗，一共多少？</>
                : <>我有 <b>{question.a}</b> 颗，买{question.item}花了 <b>{question.b}</b> 颗，还剩多少？</>}</p>
            </div>
            <div className="product"><span>{question.emoji}</span><strong>{question.item}</strong></div>
            <div className="equation">{question.a} {question.operation} {question.b} = ?</div>
            <button type="button" className="shop-hint" onClick={giveHint}>💡 给我提示</button>
          </article>

          <article className="answer-counter">
            <h2>摆出你的答案</h2>
            <div className="coin-columns">
              <div className="coin-column">
                <button type="button" onClick={() => setAnswerTens(Math.min(9, answerTens + 1))}>＋</button>
                <div className="moon-coin">☾</div><strong>{answerTens}</strong><small>月亮币<br />每枚是 10</small>
                <button type="button" onClick={() => setAnswerTens(Math.max(0, answerTens - 1))}>−</button>
              </div>
              <span className="counter-plus">＋</span>
              <div className="coin-column">
                <button type="button" onClick={() => setAnswerOnes(Math.min(9, answerOnes + 1))}>＋</button>
                <div className="star-coin">★</div><strong>{answerOnes}</strong><small>星星币<br />每颗是 1</small>
                <button type="button" onClick={() => setAnswerOnes(Math.max(0, answerOnes - 1))}>−</button>
              </div>
            </div>
            <div className="answer-number">我的答案：<strong>{answerTens * 10 + answerOnes}</strong></div>
            {showHint && <div className="visual-hint">{question.operation === '+' ? '✨ 10 颗星星币可以换成 1 枚月亮币' : '✨ 1 枚月亮币可以拆成 10 颗星星币'}</div>}
            {feedback === 'try-again' && <p className="answer-feedback try">差一点，再数一次吧！</p>}
            {feedback === 'correct' ? <button type="button" className="next-customer" onClick={nextQuestion}>答对啦！下一位客人 ›</button> : <button type="button" className="check-answer" onClick={checkAnswer}>看看对不对</button>}
          </article>
        </section>
      )}
    </main>
  )
}

export default MoonShop

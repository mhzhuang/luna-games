import { useState } from 'react'
import './GameHome.css'

type GameHomeProps = {
  onPlayConnect4: () => void
  onPlaySpotDifference: () => void
  onPlayDrawAlong: () => void
  onPlayMoonShop: () => void
}

const ROOM_DECORATIONS = [
  { id: 'moon-pillow', emoji: '🌙', name: '月亮抱枕' }, { id: 'rabbit-doll', emoji: '🐰', name: '小兔玩偶' },
  { id: 'star-lamp', emoji: '⭐', name: '星星灯' }, { id: 'rainbow-rug', emoji: '🌈', name: '彩虹地毯' },
  { id: 'rocket-model', emoji: '🚀', name: '火箭模型' }, { id: 'flower-vase', emoji: '🌸', name: '魔法花瓶' },
  { id: 'bear-cushion', emoji: '🧸', name: '小熊靠垫' }, { id: 'balloon', emoji: '🎈', name: '蓝色气球' },
]

function GameHome({ onPlayConnect4, onPlaySpotDifference, onPlayDrawAlong, onPlayMoonShop }: GameHomeProps) {
  const [ownedDecorations] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('luna-room-rewards') ?? '[]') as string[] } catch { return [] }
  })
  return (
    <main className="games-home">
      <div className="home-stars" aria-hidden="true">
        <i>✦</i><i>·</i><i>✧</i><i>·</i><i>✦</i><i>·</i><i>✧</i>
      </div>

      <header className="home-header">
        <div className="home-logo">
          <span className="home-logo-moon">☾</span>
          <span><strong>LUNA’S</strong><b>GAMES</b></span>
        </div>
        <div className="hello-pill">你好，Luna！ <span>★</span></div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">欢迎来到</p>
          <h1>Luna 的游戏乐园</h1>
          <p className="welcome-copy">选一个喜欢的游戏，开始今天的小冒险吧！</p>
        </div>
        <div className="moon-friend" aria-hidden="true">
          <span>☾</span><i>✦</i><i>✧</i>
        </div>
      </section>

      <section className="game-library" aria-labelledby="choose-game">
        <h2 id="choose-game">选择一个游戏</h2>
        <div className="game-grid">
          <button className="game-tile connect4-tile" type="button" onClick={onPlayConnect4}>
            <div className="mini-board" aria-hidden="true">
              {Array.from({ length: 20 }, (_, index) => (
                <i className={index === 17 || index === 13 || index === 9 || index === 5 ? 'sun' : index === 18 || index === 14 ? 'moon' : ''} key={index}>
                  {index === 17 || index === 13 || index === 9 || index === 5 ? '★' : index === 18 || index === 14 ? '☾' : ''}
                </i>
              ))}
            </div>
            <div className="tile-content">
              <span className="game-label">动动脑筋</span>
              <h3>四子棋</h3>
              <p>把四颗棋子连在一起！</p>
              <span className="play-pill">开始游戏 <b>›</b></span>
            </div>
          </button>

          <button className="game-tile spot-tile" type="button" onClick={onPlaySpotDifference}>
            <div className="spot-preview" aria-hidden="true">
              <img src="/games/spot-difference/moonlight-picnic.jpg" alt="" />
              <span>5</span>
            </div>
            <div className="tile-content">
              <span className="game-label">仔细观察</span>
              <h3>找不同</h3>
              <p>找出图片里的 5 处不同！</p>
              <span className="play-pill">开始游戏 <b>›</b></span>
            </div>
          </button>

          <button className="game-tile draw-tile" type="button" onClick={onPlayDrawAlong}>
            <div className="draw-preview" aria-hidden="true">
              <img src="/games/draw-along/moon-bunny.jpg" alt="" />
              <span>✎</span>
            </div>
            <div className="tile-content">
              <span className="game-label">发挥创意</span>
              <h3>跟着画</h3>
              <p>看着月亮小兔子画一画！</p>
              <span className="play-pill">开始画画 <b>›</b></span>
            </div>
          </button>

          <button className="game-tile math-tile" type="button" onClick={onPlayMoonShop}>
            <div className="math-preview" aria-hidden="true">
              <span className="shop-awning">◡ ◡ ◡</span>
              <div>🌙</div><i>★</i><i>★</i><b>+</b>
            </div>
            <div className="tile-content">
              <span className="game-label">快乐算一算</span>
              <h3>月亮商店</h3>
              <p>用星星币帮小动物买东西！</p>
              <span className="play-pill">开始营业 <b>›</b></span>
            </div>
          </button>

          <article className="more-games-card">
            <span>✦</span> 更多小游戏正在准备中…
          </article>
        </div>
      </section>

      <section className="luna-room" aria-labelledby="luna-room-title">
        <div className="room-heading"><div><span>我的收藏</span><h2 id="luna-room-title">Luna 的小房间</h2></div><p>{ownedDecorations.length} / {ROOM_DECORATIONS.length} 件装饰</p></div>
        <div className="room-scene">
          <div className="room-window">☾ <i>★</i></div>
          <div className="room-shelf">
            {ROOM_DECORATIONS.map((decoration) => (
              <div className={ownedDecorations.includes(decoration.id) ? 'owned' : 'locked'} key={decoration.id} title={ownedDecorations.includes(decoration.id) ? decoration.name : '完成月亮商店获得'}>
                <span>{ownedDecorations.includes(decoration.id) ? decoration.emoji : '?'}</span><small>{ownedDecorations.includes(decoration.id) ? decoration.name : '神秘装饰'}</small>
              </div>
            ))}
          </div>
          {ownedDecorations.length === 0 && <p className="empty-room-tip">去月亮商店完成 5 道题，就能带一件装饰回来！</p>}
        </div>
      </section>

      <footer className="home-footer">为 Luna 用心制作 <span>♥</span></footer>
    </main>
  )
}

export default GameHome

import './GameHome.css'

type GameHomeProps = {
  onPlayConnect4: () => void
  onPlaySpotDifference: () => void
  onPlayDrawAlong: () => void
}

function GameHome({ onPlayConnect4, onPlaySpotDifference, onPlayDrawAlong }: GameHomeProps) {
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

          <article className="more-games-card">
            <span>✦</span> 更多小游戏正在准备中…
          </article>
        </div>
      </section>

      <footer className="home-footer">为 Luna 用心制作 <span>♥</span></footer>
    </main>
  )
}

export default GameHome

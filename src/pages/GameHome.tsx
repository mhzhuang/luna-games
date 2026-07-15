import './GameHome.css'

type GameHomeProps = {
  onPlayConnect4: () => void
}

function GameHome({ onPlayConnect4 }: GameHomeProps) {
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

          <article className="game-tile coming-tile">
            <div className="coming-art" aria-hidden="true"><span>?</span><i>★</i><i>✦</i></div>
            <div className="tile-content">
              <span className="game-label">新的冒险</span>
              <h3>更多游戏</h3>
              <p>好玩的小游戏正在准备中…</p>
              <span className="soon-pill">即将到来</span>
            </div>
          </article>
        </div>
      </section>

      <footer className="home-footer">为 Luna 用心制作 <span>♥</span></footer>
    </main>
  )
}

export default GameHome

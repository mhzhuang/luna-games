import { useEffect, useState } from 'react'
import Connect4 from './games/connect4/Connect4'
import GameHome from './pages/GameHome'
import './App.css'

type Route = 'home' | 'connect4'

const routeFromHash = (): Route =>
  window.location.hash === '#/connect4' ? 'connect4' : 'home'

function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const goTo = (nextRoute: Route) => {
    window.location.hash = nextRoute === 'connect4' ? '/connect4' : ''
    setRoute(nextRoute)
  }

  return route === 'connect4'
    ? <Connect4 onBack={() => goTo('home')} />
    : <GameHome onPlayConnect4={() => goTo('connect4')} />
}

export default App

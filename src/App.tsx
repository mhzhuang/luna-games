import { useEffect, useState } from 'react'
import Connect4 from './games/connect4/Connect4'
import SpotDifference from './games/spot-difference/SpotDifference'
import GameHome from './pages/GameHome'
import './App.css'

type Route = 'home' | 'connect4' | 'spot-difference'

const routeFromHash = (): Route => {
  if (window.location.hash === '#/connect4') return 'connect4'
  if (window.location.hash === '#/spot-difference') return 'spot-difference'
  return 'home'
}

function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const goTo = (nextRoute: Route) => {
    window.location.hash = nextRoute === 'home' ? '' : `/${nextRoute}`
    setRoute(nextRoute)
  }

  if (route === 'connect4') return <Connect4 onBack={() => goTo('home')} />
  if (route === 'spot-difference') return <SpotDifference onBack={() => goTo('home')} />
  return (
    <GameHome
      onPlayConnect4={() => goTo('connect4')}
      onPlaySpotDifference={() => goTo('spot-difference')}
    />
  )
}

export default App

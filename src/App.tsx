import { useState } from 'react'
import { createInitialGameState } from './models'
import type { Choice, Faction, GameState } from './models'
import { acquireChapterCard, sellChapterCard } from './engine/acquireChapterCard'
import { advanceChapter, buyLandmark, resolvePendingChoice } from './engine/landMarks'
import InGameView from './components/InGameView'

const factions: { id: Faction; name: string; description: string; symbol: string }[] = [
  { id: 'fellowship', name: 'The Fellowship', description: 'Carry hope into the shadow.', symbol: '✧' },
  { id: 'sauron', name: 'Sauron', description: 'Bring all of Middle-earth to heel.', symbol: '◈' },
]

export default function App() {
  const [faction, setFaction] = useState<Faction>('fellowship')
  const [game, setGame] = useState<GameState | null>(null)

  function beginJourney() {
    const initial = createInitialGameState()
    initial.status = 'in-progress'
    setGame(initial)
  }

  function acquireCard(cardId: string, territoryId?: string) {
    setGame(current => current ? acquireChapterCard(current, current.currentPlayer, cardId, territoryId) : current)
  }

  function sellAvailableCard(cardId: string) {
    setGame(current => current ? sellChapterCard(current, current.currentPlayer, cardId) : current)
  }

  if (game) {
    return <InGameView key={game.chapter} game={game}
      onAdvanceChapter={() => setGame(current => current ? advanceChapter(current) : current)}
      onBuyLandmark={id => setGame(current => current ? buyLandmark(current, id) : current)}
      onResolveChoice={(choice: Choice) => setGame(current => current ? resolvePendingChoice(current, choice) : current)} onAcquireCard={acquireCard} onSellCard={sellAvailableCard} onExit={() => setGame(null)} />
  }

  return (
    <main className="landing">
      <header className="topbar">
        <a className="wordmark" href="./" aria-label="Duel for Middle-earth home"><span className="small-ring" /> MIDDLE-EARTH</a>
        <span className="edition">A GAME OF TWO DESTINIES</span>
      </header>

      <div className="landscape" aria-hidden="true">
        <div className="sun" /><div className="mountains distant" /><div className="mountains near" />
        <div className="horizon" /><div className="great-ring" />
      </div>

      <section className="hero" aria-labelledby="title">
        <p className="eyebrow">THE LORD OF THE RINGS</p>
        <h1 id="title">Duel for<br /><em>Middle-earth</em></h1>
        <div className="divider" aria-hidden="true"><span />✦<span /></div>
        <p className="intro">The fate of an age rests between two powers.<br />Choose your side. Begin your journey.</p>

        <div className="setup-panel">
          <p className="panel-label" id="faction-label">CHOOSE YOUR ALLEGIANCE</p>
          <div className="faction-options" role="group" aria-labelledby="faction-label">
            {factions.map((side) => (
              <button key={side.id} className={`faction ${faction === side.id ? 'selected' : ''}`}
                aria-pressed={faction === side.id} onClick={() => { setFaction(side.id); setGame(null) }}>
                <span className="faction-symbol" aria-hidden="true">{side.symbol}</span>
                <span><strong>{side.name}</strong><small>{side.description}</small></span>
                <span className="selection-dot" aria-hidden="true" />
              </button>
            ))}
          </div>
          <button className="begin-button" onClick={beginJourney}>Begin your journey <span aria-hidden="true">→</span></button>
          <p className="setup-note">Local prototype · Game rules and multiplayer coming soon</p>
        </div>
      </section>

      <footer className="footer"><span>2 PLAYERS <b>·</b> 3 CHAPTERS <b>·</b> ONE MIDDLE-EARTH</span><span>Unofficial fan project</span></footer>
    </main>
  )
}

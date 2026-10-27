import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Card, Choice, GameState } from '../models'
import { createChapterLayout } from '../engine/chapterLayouts'
import { canAcquireCard } from '../engine/cardHelper'
import { getRingTrack, getRemainingRingSteps } from '../engine/ringHelper'

import LandmarkDialogs from './GamePlay/LandmarkDialogs'
import ChapterLayoutCard from './GamePlay/ChapterLayoutCard'
import PlayerCardsModal from './GamePlay/PlayerCardsModal'
import MilitaryTerritoryModal from './GamePlay/MilitaryTerritoryModal'
import TerritoryMapModal from './GamePlay/TerritoryMapModal'
import ChapterCompleteModal from './GamePlay/ChapterCompleteModal'
import GameFinishedModal from './GamePlay/GameFinishedModal'
import { PlayerSummary } from './GamePlay/PlayerSummary'

export default function InGameView({ game, onAdvanceChapter, onBuyLandmark, onResolveChoice, onAcquireCard, onSellCard, onExit }: {
  game: GameState
  onAdvanceChapter: () => void
  onBuyLandmark: (id: string) => void
  onResolveChoice: (choice: Choice) => void
  onAcquireCard: (cardId: string, territoryId?: string) => void
  onSellCard: (cardId: string) => void
  onExit: () => void
}) {
  const [modal, setModal] = useState<'landmarks' | 'territories' | 'military' | 'finished' | 'yours' | 'opponent' | null>(null)
  const [layout] = useState(() => createChapterLayout(game.chapter, game.availableCards))
  const faction = game.currentPlayer
  const chapterCards = game.availableCards
  const [militaryCard, setMilitaryCard] = useState<Card | null>(null)
  const { rows } = layout
  const cardById = new Map(chapterCards.map(card => [card.id, card]))
  const opponentFaction = faction === 'fellowship' ? 'sauron' : 'fellowship'
  const player = game.players[faction]
  const opponent = game.players[opponentFaction]
  const ringNodes = getRingTrack(game.players.fellowship, game.players.sauron)

  useEffect(() => {
    if (game.status === 'finished') setModal('finished')
  }, [game.status])

  function buyChapterCard(cardId: string) {
    const card = cardById.get(cardId)
    if (!card || card.isCoveredBy.length > 0 || !canAcquireCard(player, card)) return
    if (card.type === 'military' && card.territories.length > 0) {
      setMilitaryCard(card)
      setModal('military')
      return
    }
    completeChapterCard(cardId)
  }

  function completeChapterCard(cardId: string, territoryId?: string, sell = false) {
    if (sell) onSellCard(cardId)
    else onAcquireCard(cardId, territoryId)
    setModal(null)
  }

  return (
    <main className="game-view">
      <div className="game-board">
        <section className="game-panel ring-panel" aria-label="Ring journey">
          <div className="vertical-ring-track" style={{ '--ring-node-count': ringNodes.length } as CSSProperties} role="img" aria-label={`Ring journey: Sauron needs ${getRemainingRingSteps(game.players.sauron)} steps to catch the Fellowship. Fellowship needs ${getRemainingRingSteps(game.players.fellowship)} steps to reach the golden ring.`}>
            {ringNodes.map((node, index) => (
              <span key={node.id} style={{ '--ring-node-index': index } as CSSProperties} className={`ring-node${node.bonus ? ' bonus-node' : ''}${node.destination ? ' ring-destination' : ''}`} aria-hidden="true">
                {node.bonus ? '★' : ''}
                {node.sauron && <span className="ring-character ring-character-sauron" />}
                {node.fellowship && <span className="ring-character ring-character-fellowship" />}
              </span>
            ))}
          </div>
        </section>

        <section className="game-panel chapter-panel" aria-labelledby="chapter-heading">
          <header className="chapter-heading">
            <div><p className="eyebrow">DUEL FOR MIDDLE-EARTH</p><h1 id="chapter-heading">Chapter {game.chapter}</h1><p className={`active-faction active-${faction}`}>{player.name}’s turn</p></div>
          </header>
          <div className={`chapter-card-layout chapter-${game.chapter}`} style={{ '--rows': rows.length } as CSSProperties}>
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={`chapter-row${row.spread ? ' spread-row' : ''}`} style={{ '--row': rowIndex } as CSSProperties}>
                {row.ids.map(id => {
                  const card = cardById.get(id)
                  if (!card) return <span className="chapter-card-slot" key={id} />
                  const available = card.isCoveredBy.length === 0 && !game.pendingChoice && !game.chapterComplete && game.status === 'in-progress'
                  return <ChapterLayoutCard key={id} card={card} player={player}
                    available={available} initiallyFaceUp={row.faceUp}
                    onBuy={() => buyChapterCard(id)} onSell={() => completeChapterCard(id, undefined, true)} />
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="game-sidebar" aria-label="Players and game controls">
          <PlayerSummary label="Next player" player={opponent} onClick={() => setModal('opponent')} />
          <section className="game-panel sidebar-controls" aria-labelledby="controls-heading">
            <nav className="game-actions" aria-label="Game controls">
              <button className="game-button" onClick={() => setModal('territories')}>Territory map</button>
              <button className="game-button" onClick={() => setModal('landmarks')}>Landmarks</button>
              <button className="game-button" onClick={onExit}>Back to setup</button>
            </nav>
          </section>
          <PlayerSummary label="Active player" player={player} onClick={() => setModal('yours')} />
        </aside>
      </div>

      {(modal === 'yours' || modal === 'opponent') && <PlayerCardsModal
        landmarkIds={game.ownedLandmarks[modal === 'opponent' ? opponentFaction : faction]} player={modal === 'opponent' ? opponent : player} isOpponent={modal === 'opponent'} onClose={() => setModal(null)} />}
      {modal === 'military' && militaryCard && <MilitaryTerritoryModal card={militaryCard}
        onClose={() => { setModal(null); setMilitaryCard(null) }} onSelectTerritory={id => {
          setMilitaryCard(null)
          setModal(null)
          completeChapterCard(militaryCard.id, id)
        }} />}
      {modal === 'territories' && <TerritoryMapModal territories={game.territories} onClose={() => setModal(null)} />}
      {game.chapterComplete && <ChapterCompleteModal chapter={game.chapter}
        onClose={() => setModal(null)} onAdvance={onAdvanceChapter} />}
      {modal === 'finished' && <GameFinishedModal game={game} onClose={() => setModal(null)} onExit={onExit} />}

      <LandmarkDialogs game={game} marketOpen={modal === 'landmarks'} onClose={() => setModal(null)}
        onBuy={id => { setModal(null); onBuyLandmark(id) }} onResolve={onResolveChoice} />
    </main>
  )
}

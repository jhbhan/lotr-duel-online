import type { Choice, GameState } from '../../models'
import { landMarkDefinitions } from '../../data/landMarks'
import { getLandmarkCost, legalMovements } from '../../engine/landMarks'
import CardFront, { describeCard } from '../CardFront'
import Modal from './Modal'

function CoinAmount({ count }: { count: number }) {
  return <span className="landmark-coin-amount" aria-label={`${count} coins`}>
    <span className="effect-icon effect-coin" aria-hidden="true">{count}</span>
  </span>
}

function LandmarkEffect({ effect }: { effect: string }) {
  const ring = effect.match(/character (\d+) spaces?/)
  const movement = effect.match(/Complete (\d+) movements?/)
  const units = effect.match(/and (\d+) units?/)
  const coins = effect.match(/Take (\d+) coins/)
  return <li className="landmark-effect">
    <span className="landmark-effect-icons" aria-hidden="true">
      {ring && Array.from({ length: Number(ring[1]) }, (_, i) => <span key={i} className="effect-icon effect-ring" />)}
      {movement && <span className="unit-movement-icon"><span className="effect-icon effect-shield">{movement[1]}</span><span className="movement-arrow">→</span></span>}
      {units && <span className="effect-icon effect-shield">{units[1]}</span>}
      {coins && <span className="effect-icon effect-coin">{coins[1]}</span>}
    </span>
  </li>
}

export default function LandmarkDialogs({ game, marketOpen, onClose, onBuy, onResolve }: {
  game: GameState
  marketOpen: boolean
  onClose: () => void
  onBuy: (id: string) => void
  onResolve: (choice: Choice) => void
}) {
  const pending = game.pendingChoice
  const actor = game.players[game.currentPlayer]
  const opponent = game.players[game.currentPlayer === 'sauron' ? 'fellowship' : 'sauron']
  const territoryName = (id: string) => game.territories.find(t => t.id === id)?.name ?? id
  if (pending) {
    const title = pending.type === 'movement' ? 'Move one unit' : pending.type === 'military' ? 'Choose a territory' : pending.type === 'discard-opponent' ? 'Discard an opponent gray card' : 'Play a discarded card for free'
    const cards = pending.type === 'discard-opponent' ? opponent.ownedCards.filter(c => c.type === 'resource') : game.discardedCards
    return <Modal key={pending.type} title={title} dismissible={false} onClose={onClose}>
      <p>{actor.name} resolves this choice.</p>
      {pending.type === 'movement' ? <div className="choice-list">
        {legalMovements(game).map(move => <button className="game-button" key={`${move.from}-${move.to}`} onClick={() => onResolve(move)}><span className="unit-movement-icon" aria-hidden="true"><span className="effect-icon effect-shield">1</span><span className="movement-arrow">→</span></span> {territoryName(move.from)} → {territoryName(move.to)}</button>)}
        <button className="game-button" onClick={() => onResolve({ decline: true })}>Decline remaining movements</button>
      </div> : pending.type === 'military' ? <div className="military-territory-choices">
        {pending.card.territories.map(id => <button className={`game-button territory-choice territory-${id}`} key={id} onClick={() => onResolve({ territoryId: id })}><span className="effect-icon effect-shield">{pending.card.value}</span> {territoryName(id)}</button>)}
      </div> : <div className="choice-cards">{cards.map(card => <button className="choice-card" key={card.id} aria-label={`Choose ${describeCard(card)}`} onClick={() => onResolve({ cardId: card.id })}><CardFront card={card} /></button>)}</div>}
    </Modal>
  }
  if (!marketOpen) return null
  const surcharge = game.territories.filter(t => t.fortress === game.currentPlayer).length
  return <Modal title="Landmarks" onClose={onClose}>
    <p className="landmark-wallet">{actor.name} · <CoinAmount count={actor.coinCount} /> · Fortress surcharge: <CoinAmount count={surcharge} /></p>
    <div className="landmark-market">{game.landmarkMarket.map(id => {
      const tile = landMarkDefinitions.find(tile => tile.id === id)!
      const cost = getLandmarkCost(game, id)
      const occupied = game.territories.find(t => t.id === tile.territoryId)?.fortress
      return <article className={`landmark-tile territory-${tile.territoryId}`} key={id}>
        <h3>{tile.name} | {territoryName(tile.territoryId)}</h3>
        <div className="landmark-resources" aria-label={`Required resources: ${tile.cost.join(', ')}`}>{tile.cost.map((resource, i) => <span key={i} title={resource} className={`effect-icon effect-resource resource-${resource}`} />)}</div>
        <ul className="landmark-effects">{tile.effects.map(effect => <LandmarkEffect key={effect} effect={effect} />)}</ul>
        {!tile.supported && <p>Unavailable until alliance tokens are supported.</p>}
        {occupied && <p>Fortress space already occupied.</p>}
        <button className="game-button landmark-buy-button" disabled={!tile.supported || !!occupied || cost > actor.coinCount || game.chapterComplete || game.status !== 'in-progress'} onClick={() => onBuy(id)} aria-label={`Buy ${tile.name} for ${cost} coins`}>Buy For <CoinAmount count={cost} /></button>
      </article>
    })}</div>
    {!game.landmarkMarket.length && <p>No landmarks available. The market refills at the next chapter.</p>}
  </Modal>
}

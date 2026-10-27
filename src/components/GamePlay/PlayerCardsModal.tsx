import { landMarkDefinitions } from '../../data/landMarks'
import type { CardType, User } from '../../models'
import CardFront, { describeCard } from '../CardFront'
import Modal from './Modal'

const cardGroups: { type: CardType; color: string }[] = [
  { type: 'resource', color: 'Gray' },
  { type: 'gold', color: 'Yellow' },
  { type: 'alliance', color: 'Green' },
  { type: 'ring', color: 'Blue' },
  { type: 'military', color: 'Red' },
]

export default function PlayerCardsModal({ player, isOpponent, onClose, landmarkIds }: {
  landmarkIds: string[]
  player: User
  isOpponent: boolean
  onClose: () => void
}) {
  return <Modal title={isOpponent ? 'Opponent’s cards' : 'Your cards'} onClose={onClose}>
    <p className="game-caption">{player.name} · {player.ownedCards.length} acquired cards · Ring progress: {player.ringJourney}</p>
    {landmarkIds.length > 0 && <section><h3>Claimed landmarks</h3>{landmarkIds.map(id => <p key={id}>{landMarkDefinitions.find(tile => tile.id === id)?.name}</p>)}</section>}
    <div className="card-collection">
      {cardGroups.map(({ type, color }) => {
        const cards = player.ownedCards.filter(card => card.type === type)
        if (cards.length === 0) return null
        return <section className="card-color-group" key={type} aria-label={`${color} cards`}>
          <h3 className="summary-label">{color} · {cards.length}</h3>
          <div className="owned-card-stack">
            {cards.map(card => <div className="owned-card" key={card.id} aria-label={describeCard(card)}><CardFront card={card} /></div>)}
          </div>
        </section>
      })}
      {player.ownedCards.length === 0 && <p className="game-caption">No cards acquired yet.</p>}
    </div>
  </Modal>
}

import type { User } from '../../models'
import CardFront, { describeCard } from '../CardFront'
import Modal from './Modal'

export default function PlayerCardsModal({ player, isOpponent, onClose }: {
  player: User
  isOpponent: boolean
  onClose: () => void
}) {
  return <Modal title={isOpponent ? 'Opponent’s cards' : 'Your cards'} onClose={onClose}>
    <p className="game-caption">{player.name} · {player.ownedCards.length} acquired cards · Ring progress: {player.ringJourney}</p>
    <div className="collection-placeholder">
      {player.ownedCards.map(card => <div className="owned-card" key={card.id} aria-label={describeCard(card)}><CardFront card={card} /></div>)}
      {player.ownedCards.length === 0 && <p className="game-caption">No cards acquired yet.</p>}
    </div>
  </Modal>
}

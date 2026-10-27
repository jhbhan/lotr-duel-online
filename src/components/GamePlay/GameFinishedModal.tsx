import type { GameState } from '../../models'
import Modal from './Modal'

export default function GameFinishedModal({ game, onClose, onExit }: {
  game: GameState
  onClose: () => void
  onExit: () => void
}) {
  const winner = Object.values(game.players).find(user => user.id === game.winnerId)

  return <Modal title="Game finished" onClose={onClose} dismissible={game.status !== 'finished'}>
    <div className="finished-placeholder">
      <span aria-hidden="true">✧</span>
      <p className="eyebrow">END OF THE JOURNEY</p>
      <h3>{winner ? `${winner.name} wins` : 'Shared victory'}</h3>
      <p>{{ ring: 'Quest of the Ring victory.', races: 'Six different races rallied.', territories: 'Presence in all seven territories.', 'final-territories': 'Most territories at the end of Chapter 3.', shared: 'Both factions have equal territory presence.' }[game.victoryReason ?? 'shared']}</p>
      {game.status !== 'finished' && <p className="game-caption">Preview only · This game has not finished.</p>}
      <button className="begin-button" onClick={onExit}>Return to setup</button>
    </div>
  </Modal>
}

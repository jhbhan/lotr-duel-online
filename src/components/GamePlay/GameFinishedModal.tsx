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
      <h3>{winner ? `${winner.name} wins` : 'Winner placeholder'}</h3>
      <p>{winner ? 'Quest of the Ring victory.' : 'Winning faction, victory condition, and final results will appear here.'}</p>
      {game.status !== 'finished' && <p className="game-caption">Preview only · This game has not finished.</p>}
      <button className="begin-button" onClick={onExit}>Return to setup</button>
    </div>
  </Modal>
}

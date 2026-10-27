import type { Choice, GameState } from '../../models'
import Modal from './Modal'
import { legalMovements } from '../../engine/turnResolver'
import CardChoiceGrid from './CardChoiceGrid'
import TerritoryChoices from './TerritoryChoices'

export default function PendingChoiceDialog({
  game,
  onClose,
  onResolve,
}: {
  game: GameState
  onClose: () => void
  onResolve: (choice: Choice) => void
}) {
  const pending = game.pendingChoice
  const actor = game.players[game.currentPlayer]
  const opponent = game.players[game.currentPlayer === 'sauron' ? 'fellowship' : 'sauron']
  const territoryName = (id: string) => game.territories.find((t) => t.id === id)?.name ?? id
  if (pending) {
    const title =
      pending.type === 'movement'
        ? 'Move one unit'
        : pending.type === 'military'
          ? 'Choose a territory'
          : pending.type === 'discard-opponent'
            ? 'Discard an opponent gray card'
            : 'Play a discarded card for free'
    const cards =
      pending.type === 'discard-opponent'
        ? opponent.ownedCards.filter((c) => c.type === 'resource')
        : game.discardedCards
    return (
      <Modal key={pending.type} title={title} dismissible={false} onClose={onClose}>
        <p>{actor.name} resolves this choice.</p>
        {pending.type === 'movement' ? (
          <div className="choice-list">
            {legalMovements(game).map((move) => (
              <button
                className="game-button"
                key={`${move.from}-${move.to}`}
                onClick={() => onResolve(move)}
              >
                <span className="unit-movement-icon" aria-hidden="true">
                  <span className="movement-arrow">→</span>
                </span>{' '}
                {territoryName(move.from)} → {territoryName(move.to)}
              </button>
            ))}
            <button className="game-button" onClick={() => onResolve({ decline: true })}>
              Decline remaining movements
            </button>
          </div>
        ) : pending.type === 'military' ? (
          <TerritoryChoices
            territoryIds={pending.card.territories}
            units={pending.card.value}
            onSelect={(territoryId) => onResolve({ territoryId })}
          />
        ) : (
          <CardChoiceGrid cards={cards} onSelect={(cardId) => onResolve({ cardId })} />
        )}
      </Modal>
    )
  }
  return null
}

import type { Choice, GameState } from '../../models'
import LandmarkMarket from './LandmarkMarket'
import PendingChoiceDialog from './PendingChoiceDialog'

export default function LandmarkDialogs({
  game,
  marketOpen,
  onClose,
  onBuy,
  onResolve,
}: {
  game: GameState
  marketOpen: boolean
  onClose: () => void
  onBuy: (id: string) => void
  onResolve: (choice: Choice) => void
}) {
  if (game.pendingChoice)
    return <PendingChoiceDialog game={game} onClose={onClose} onResolve={onResolve} />
  return marketOpen ? <LandmarkMarket game={game} onClose={onClose} onBuy={onBuy} /> : null
}

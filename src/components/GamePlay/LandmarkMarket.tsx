import type { GameState } from '../../models'
import { landMarkDefinitions } from '../../data/landMarks'
import { getLandmarkCost } from '../../engine/landMarks'
import Modal from './Modal'
import CoinAmount from '../CoinAmount'
import ResourceIcon from '../ResourceIcon'

export default function LandmarkMarket({
  game,
  onClose,
  onBuy,
}: {
  game: GameState
  onClose: () => void
  onBuy: (id: string) => void
}) {
  const actor = game.players[game.currentPlayer]
  const territoryName = (id: string) => game.territories.find((t) => t.id === id)?.name ?? id
  const surcharge = game.territories.filter((t) => t.fortress === game.currentPlayer).length
  return (
    <Modal title="Landmarks" onClose={onClose}>
      <p className="landmark-wallet">
        Additional cost per landmark: <CoinAmount count={surcharge} />
      </p>
      <div className="landmark-market">
        {game.landmarkMarket.map((id) => {
          const tile = landMarkDefinitions.find((tile) => tile.id === id)!
          const cost = getLandmarkCost(game, id)
          const occupied = game.territories.find((t) => t.id === tile.territoryId)?.fortress
          return (
            <article className={`landmark-tile territory-${tile.territoryId}`} key={id}>
              <h3 className="landmark-heading">
                <span>{tile.name}</span>
                <span className="landmark-territory">{territoryName(tile.territoryId)}</span>
              </h3>
              <div
                className="landmark-resources"
                aria-label={`Required resources: ${tile.cost.join(', ')}`}
              >
                {tile.cost.map((resource, i) => (
                  <ResourceIcon key={i} resource={resource} />
                ))}
              </div>
              <ul className="landmark-effects">
                {tile.effects.map((effect) => (
                  <li key={effect}>{effect}</li>
                ))}
              </ul>
              {!tile.supported && <p>Unavailable until alliance tokens are supported.</p>}
              {occupied && <p>Fortress space already occupied.</p>}
              <button
                className="game-button landmark-buy-button"
                disabled={
                  !tile.supported ||
                  !!occupied ||
                  cost > actor.coinCount ||
                  game.chapterComplete ||
                  game.status !== 'in-progress'
                }
                onClick={() => onBuy(id)}
                aria-label={`Buy ${tile.name} for ${cost} coins`}
              >
                Buy For <CoinAmount count={cost} />
              </button>
            </article>
          )
        })}
      </div>
      {!game.landmarkMarket.length && (
        <p>No landmarks available. The market refills at the next chapter.</p>
      )}
    </Modal>
  )
}

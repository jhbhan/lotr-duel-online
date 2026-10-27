import type { Effect, GameState } from '../models'
import { landMarkDefinitions } from '../data/landMarks'
import { getCost } from './cardHelper'
import { assertAction, drain } from './turnResolver'

export const getLandmarkCost = (game: GameState, id: string) => {
  const tile = landMarkDefinitions.find((tile) => tile.id === id)
  if (!tile) throw new Error('Unknown landmark.')
  return (
    getCost(game.players[game.currentPlayer], tile.cost) +
    game.territories.filter((t) => t.fortress === game.currentPlayer).length
  )
}
export const buyLandmark = (state: GameState, id: string) => {
  assertAction(state)
  const tile = landMarkDefinitions.find((t) => t.id === id)
  if (!tile?.supported || !state.landmarkMarket.includes(id))
    throw new Error('Landmark unavailable.')
  if (state.territories.find((t) => t.id === tile.territoryId)?.fortress)
    throw new Error('Fortress space occupied.')
  const cost = getLandmarkCost(state, id)
  if (state.players[state.currentPlayer].coinCount < cost) throw new Error('Not enough coins.')
  const game = structuredClone(state)
  game.players[game.currentPlayer].coinCount -= cost
  game.landmarkMarket = game.landmarkMarket.filter((tileId) => tileId !== id)
  game.ownedLandmarks[game.currentPlayer].push(id)
  const effects: Effect[] = [{ type: 'fortress', territoryId: tile.territoryId }]
  const units = id === 'bree' ? 2 : id === 'helms-deep' ? 3 : id === 'minas-tirith' ? 1 : 0
  if (units) effects.push({ type: 'units', territoryId: tile.territoryId, count: units })
  if (id === 'barad-dur') effects.push({ type: 'discard-card' })
  if (id === 'erebor') effects.push({ type: 'coins', count: 5 })
  if (id === 'bree' || id === 'erebor')
    for (let i = 0; i < (id === 'bree' ? 2 : 1); i++) effects.push({ type: 'movement' })
  if (id === 'isengard') effects.push({ type: 'discard-opponent' }, { type: 'ring', count: 1 })
  if (id === 'minas-tirith') effects.push({ type: 'ring', count: 2 })
  game.effectQueue = effects
  return drain(game)
}

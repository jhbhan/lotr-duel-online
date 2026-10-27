import type { Card, Choice, Effect, Faction, GameState } from '../models'
import { landMarkDefinitions } from '../data/landMarks'
import { addCardToUser, acquireCardForUser, getCost, removeCardFromUser } from './cardHelper'
import { ChapterEngine } from './chapterEngine'
import { createChapterLayout } from './chapterLayouts'
import { addFortressToTerritory, addUnitsToTerritory, moveUnitsBetweenTerritories } from './territoryHelper'
import { advanceRingJourney } from './ringHelper'
import { checkRaceWin, checkRingJourneyWin, checkTerritoryWin, checkFinalWinCondition } from './winConditions'

const other = (faction: Faction) => faction === 'sauron' ? 'fellowship' as const : 'sauron' as const
export const getLandmarkCost = (game: GameState, id: string) => {
  const tile = landMarkDefinitions.find(tile => tile.id === id)
  if (!tile) throw new Error('Unknown landmark.')
  return getCost(game.players[game.currentPlayer], tile.cost) + game.territories.filter(t => t.fortress === game.currentPlayer).length
}
export const legalMovements = (game: GameState) => game.territories.flatMap(from =>
  from.unitType === game.currentPlayer && from.unitCount > 0
    ? from.adjacentTerritoryIds.map(to => ({ from: from.id, to })) : [])
const assertAction = (game: GameState, faction = game.currentPlayer) => {
  if (game.status !== 'in-progress' || game.pendingChoice || game.effectQueue.length || game.chapterComplete || faction !== game.currentPlayer)
    throw new Error('Finish the current turn before taking another action.')
}
const checkVictory = (game: GameState) => {
  for (const faction of [game.currentPlayer, other(game.currentPlayer)]) {
    const player = game.players[faction]
    const reason = checkRingJourneyWin(player) ? 'ring' : checkRaceWin(player) ? 'races' : checkTerritoryWin(player, game.territories) ? 'territories' : null
    if (reason) {
      game.status = 'finished'; game.winnerId = player.id; game.victoryReason = reason
      game.effectQueue = []; game.pendingChoice = null
      return true
    }
  }
  return false
}
const finishTurn = (game: GameState) => {
  game.currentPlayer = other(game.currentPlayer)
  if (game.resolvingChapterCard && !game.availableCards.length) {
    if (game.chapter === 3) {
      const winner = checkFinalWinCondition(game.players[game.currentPlayer], game.territories)
      game.status = 'finished'; game.winnerId = winner ? game.players[winner].id : null
      game.victoryReason = winner ? 'final-territories' : 'shared'
    } else game.chapterComplete = true
  }
  game.resolvingChapterCard = false
}
const drain = (game: GameState) => {
  if (checkVictory(game)) return game
  while (game.effectQueue.length) {
    const effect = game.effectQueue.shift()!
    const player = game.players[game.currentPlayer]
    if (effect.type === 'movement' || effect.type === 'discard-opponent' || effect.type === 'discard-card' || effect.type === 'military') {
      const available = effect.type === 'movement' ? legalMovements(game).length : effect.type === 'discard-opponent'
        ? game.players[other(game.currentPlayer)].ownedCards.some(c => c.type === 'resource')
        : effect.type === 'discard-card' ? game.discardedCards.length : true
      if (available) { game.pendingChoice = effect; return game }
    } else if (effect.type === 'fortress') addFortressToTerritory(game.territories.find(t => t.id === effect.territoryId)!, game.currentPlayer)
    else if (effect.type === 'units') addUnitsToTerritory(game.territories.find(t => t.id === effect.territoryId)!, game.currentPlayer, effect.count)
    else if (effect.type === 'coins') player.coinCount += effect.count
    else if (effect.type === 'ring') advanceRingJourney(player, effect.count)
    if (checkVictory(game)) return game
  }
  finishTurn(game)
  return game
}
const playCard = (game: GameState, card: Card, free: boolean, territoryId?: string) => {
  const actor = game.currentPlayer
  if (free) addCardToUser(game.players[actor], card)
  else game.players[actor] = acquireCardForUser(game.players[actor], card)
  if (card.type === 'military') {
    if (territoryId) {
      if (!card.territories.includes(territoryId) || !game.territories.some(t => t.id === territoryId)) throw new Error('Invalid military destination.')
      game.effectQueue.unshift({ type: 'units', territoryId, count: card.value })
    } else game.effectQueue.unshift({ type: 'military', card })
  }
}
export const buyLandmark = (state: GameState, id: string) => {
  assertAction(state)
  const tile = landMarkDefinitions.find(t => t.id === id)
  if (!tile?.supported || !state.landmarkMarket.includes(id)) throw new Error('Landmark unavailable.')
  if (state.territories.find(t => t.id === tile.territoryId)?.fortress) throw new Error('Fortress space occupied.')
  const cost = getLandmarkCost(state, id)
  if (state.players[state.currentPlayer].coinCount < cost) throw new Error('Not enough coins.')
  const game = structuredClone(state)
  game.players[game.currentPlayer].coinCount -= cost
  game.landmarkMarket = game.landmarkMarket.filter(tileId => tileId !== id)
  game.ownedLandmarks[game.currentPlayer].push(id)
  const effects: Effect[] = [{ type: 'fortress', territoryId: tile.territoryId }]
  const units = id === 'bree' ? 2 : id === 'helms-deep' ? 3 : id === 'minas-tirith' ? 1 : 0
  if (units) effects.push({ type: 'units', territoryId: tile.territoryId, count: units })
  if (id === 'barad-dur') effects.push({ type: 'discard-card' })
  if (id === 'erebor') effects.push({ type: 'coins', count: 5 })
  if (id === 'bree' || id === 'erebor') for (let i = 0; i < (id === 'bree' ? 2 : 1); i++) effects.push({ type: 'movement' })
  if (id === 'isengard') effects.push({ type: 'discard-opponent' }, { type: 'ring', count: 1 })
  if (id === 'minas-tirith') effects.push({ type: 'ring', count: 2 })
  game.effectQueue = effects
  return drain(game)
}
export const resolvePendingChoice = (state: GameState, choice: Choice) => {
  if (state.status !== 'in-progress' || !state.pendingChoice) throw new Error('No choice pending.')
  const game = structuredClone(state)
  const pending = game.pendingChoice!
  game.pendingChoice = null
  if (pending.type === 'movement') {
    if ('decline' in choice) game.effectQueue = game.effectQueue.filter(e => e.type !== 'movement')
    else {
      if (!('from' in choice) || !legalMovements(game).some(m => m.from === choice.from && m.to === choice.to)) throw new Error('Invalid movement.')
      moveUnitsBetweenTerritories(game.territories.find(t => t.id === choice.from)!, game.territories.find(t => t.id === choice.to)!, 1)
    }
  } else if (pending.type === 'military') {
    if (!('territoryId' in choice) || !pending.card.territories.includes(choice.territoryId) || !game.territories.some(t => t.id === choice.territoryId)) throw new Error('Invalid territory.')
    game.effectQueue.unshift({ type: 'units', territoryId: choice.territoryId, count: pending.card.value })
  } else {
    if (!('cardId' in choice)) throw new Error('Choose a card.')
    if (pending.type === 'discard-opponent') {
      const opponent = game.players[other(game.currentPlayer)]
      if (!opponent.ownedCards.some(c => c.id === choice.cardId && c.type === 'resource')) throw new Error('Choose an opponent gray card.')
      game.discardedCards.push(removeCardFromUser(opponent, choice.cardId))
      opponent.hasOptionalOne = opponent.ownedCards.some(c => c.specialEffect?.includes('optional-resource-crs'))
      opponent.hasOptionalTwo = opponent.ownedCards.some(c => c.specialEffect?.includes('optional-resource-kl'))
    } else {
      const card = game.discardedCards.find(c => c.id === choice.cardId)
      if (!card) throw new Error('Choose a discarded card.')
      game.discardedCards = game.discardedCards.filter(c => c.id !== card.id)
      playCard(game, card, true)
    }
  }
  return drain(game)
}
export const takeChapterCard = (state: GameState, faction: Faction, id: string, sell = false, territoryId?: string) => {
  assertAction(state, faction)
  const game = structuredClone(state)
  const engine = new ChapterEngine(game.availableCards)
  const card = engine.removeCard(id)
  game.availableCards = engine.cards
  game.resolvingChapterCard = true
  if (sell) { game.players[faction].coinCount += game.chapter; game.discardedCards.push(card) }
  else playCard(game, card, false, territoryId)
  return drain(game)
}
export const advanceChapter = (state: GameState) => {
  if (!state.chapterComplete || state.chapter === 3 || state.pendingChoice || state.status !== 'in-progress') throw new Error('Chapter is not complete.')
  const game = structuredClone(state)
  game.chapter = (game.chapter + 1) as 2 | 3
  const deal = createChapterLayout(game.chapter)
  game.availableCards = deal.cards; game.discardedCards.push(...deal.discardedCards)
  while (game.landmarkMarket.length < 3 && game.landmarkReserve.length) game.landmarkMarket.push(game.landmarkReserve.shift()!)
  game.chapterComplete = false
  return game
}

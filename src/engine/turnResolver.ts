import type { Card, Choice, Faction, GameState } from '../models'
import { addCardToUser, acquireCardForUser, removeCardFromUser } from './cardHelper'
import {
  addFortressToTerritory,
  addUnitsToTerritory,
  moveUnitsBetweenTerritories,
} from './territoryHelper'
import { advanceRingJourney } from './ringHelper'
import {
  checkRaceWin,
  checkRingJourneyWin,
  checkTerritoryWin,
  checkFinalWinCondition,
} from './winConditions'

export const other = (faction: Faction) =>
  faction === 'sauron' ? ('fellowship' as const) : ('sauron' as const)
export const legalMovements = (game: GameState) =>
  game.territories.flatMap((from) =>
    from.unitType === game.currentPlayer && from.unitCount > 0
      ? from.adjacentTerritoryIds.map((to) => ({ from: from.id, to }))
      : [],
  )
export const assertAction = (game: GameState, faction = game.currentPlayer) => {
  if (
    game.status !== 'in-progress' ||
    game.pendingChoice ||
    game.effectQueue.length ||
    game.chapterComplete ||
    faction !== game.currentPlayer
  )
    throw new Error('Finish the current turn before taking another action.')
}
const checkVictory = (game: GameState) => {
  for (const faction of [game.currentPlayer, other(game.currentPlayer)]) {
    const player = game.players[faction]
    const reason = checkRingJourneyWin(player)
      ? 'ring'
      : checkRaceWin(player)
        ? 'races'
        : checkTerritoryWin(player, game.territories)
          ? 'territories'
          : null
    if (reason) {
      game.status = 'finished'
      game.winnerId = player.id
      game.victoryReason = reason
      game.effectQueue = []
      game.pendingChoice = null
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
      game.status = 'finished'
      game.winnerId = winner ? game.players[winner].id : null
      game.victoryReason = winner ? 'final-territories' : 'shared'
    } else game.chapterComplete = true
  }
  game.resolvingChapterCard = false
}
export const drain = (game: GameState) => {
  if (checkVictory(game)) return game
  while (game.effectQueue.length) {
    const effect = game.effectQueue.shift()!
    const player = game.players[game.currentPlayer]
    if (
      effect.type === 'movement' ||
      effect.type === 'discard-opponent' ||
      effect.type === 'discard-card' ||
      effect.type === 'military'
    ) {
      const available =
        effect.type === 'movement'
          ? legalMovements(game).length
          : effect.type === 'discard-opponent'
            ? game.players[other(game.currentPlayer)].ownedCards.some((c) => c.type === 'resource')
            : effect.type === 'discard-card'
              ? game.discardedCards.length
              : true
      if (available) {
        game.pendingChoice = effect
        return game
      }
    } else if (effect.type === 'fortress')
      addFortressToTerritory(
        game.territories.find((t) => t.id === effect.territoryId)!,
        game.currentPlayer,
      )
    else if (effect.type === 'units')
      addUnitsToTerritory(
        game.territories.find((t) => t.id === effect.territoryId)!,
        game.currentPlayer,
        effect.count,
      )
    else if (effect.type === 'coins') player.coinCount += effect.count
    else if (effect.type === 'ring') advanceRingJourney(player, effect.count)
    if (checkVictory(game)) return game
  }
  finishTurn(game)
  return game
}
export const playCard = (game: GameState, card: Card, free: boolean, territoryId?: string) => {
  const actor = game.currentPlayer
  if (free) addCardToUser(game.players[actor], card)
  else game.players[actor] = acquireCardForUser(game.players[actor], card)
  if (card.type === 'military') {
    if (territoryId) {
      if (
        !card.territories.includes(territoryId) ||
        !game.territories.some((t) => t.id === territoryId)
      )
        throw new Error('Invalid military destination.')
      game.effectQueue.unshift({ type: 'units', territoryId, count: card.value })
    } else game.effectQueue.unshift({ type: 'military', card })
  }
}
export const resolvePendingChoice = (state: GameState, choice: Choice) => {
  if (state.status !== 'in-progress' || !state.pendingChoice) throw new Error('No choice pending.')
  const game = structuredClone(state)
  const pending = game.pendingChoice!
  game.pendingChoice = null
  if (pending.type === 'movement') {
    if ('decline' in choice)
      game.effectQueue = game.effectQueue.filter((e) => e.type !== 'movement')
    else {
      if (
        !('from' in choice) ||
        !legalMovements(game).some((m) => m.from === choice.from && m.to === choice.to)
      )
        throw new Error('Invalid movement.')
      moveUnitsBetweenTerritories(
        game.territories.find((t) => t.id === choice.from)!,
        game.territories.find((t) => t.id === choice.to)!,
        1,
      )
    }
  } else if (pending.type === 'military') {
    if (
      !('territoryId' in choice) ||
      !pending.card.territories.includes(choice.territoryId) ||
      !game.territories.some((t) => t.id === choice.territoryId)
    )
      throw new Error('Invalid territory.')
    game.effectQueue.unshift({
      type: 'units',
      territoryId: choice.territoryId,
      count: pending.card.value,
    })
  } else {
    if (!('cardId' in choice)) throw new Error('Choose a card.')
    if (pending.type === 'discard-opponent') {
      const opponent = game.players[other(game.currentPlayer)]
      if (!opponent.ownedCards.some((c) => c.id === choice.cardId && c.type === 'resource'))
        throw new Error('Choose an opponent gray card.')
      game.discardedCards.push(removeCardFromUser(opponent, choice.cardId))
      opponent.hasOptionalOne = opponent.ownedCards.some((c) =>
        c.specialEffect?.includes('optional-resource-crs'),
      )
      opponent.hasOptionalTwo = opponent.ownedCards.some((c) =>
        c.specialEffect?.includes('optional-resource-kl'),
      )
    } else {
      const card = game.discardedCards.find((c) => c.id === choice.cardId)
      if (!card) throw new Error('Choose a discarded card.')
      game.discardedCards = game.discardedCards.filter((c) => c.id !== card.id)
      playCard(game, card, true)
    }
  }
  return drain(game)
}

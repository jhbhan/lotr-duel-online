import type { Faction, GameState } from '../models'
import { ChapterEngine } from './chapterEngine'
import { acquireCardForUser } from './cardHelper'
import { addUnitsToTerritory } from './territoryHelper'
import { sellCard } from './cardHelper'
import { hasCompletedRingJourney } from './ringHelper'

/** Commit payment, ownership, effects, and uncovering as one state update. */
export function acquireChapterCard(game: GameState, faction: Faction, cardId: string, territoryId?: string) {
  if (game.status !== 'in-progress') throw new Error('The game is not in progress.')
  const engine = new ChapterEngine(game.availableCards)
  const card = engine.removeCard(cardId)
  if (card.type === 'military' && (
    !territoryId || !card.territories.includes(territoryId) ||
    !game.territories.some(territory => territory.id === territoryId)
  )) throw new Error('Choose one of the card’s territories.')

  const player = acquireCardForUser(game.players[faction], card)
  const territories = game.territories.map(territory => {
    if (card.type !== 'military' || territory.id !== territoryId) return territory
    const updated = { ...territory }
    addUnitsToTerritory(updated, faction, card.value)
    return updated
  })
  return {
    ...game,
    players: { ...game.players, [faction]: player },
    availableCards: engine.cards,
    territories,
    status: hasCompletedRingJourney(player) ? 'finished' as const : game.status,
    winnerId: hasCompletedRingJourney(player) ? player.id : game.winnerId,
  }
}

export function sellChapterCard(game: GameState, faction: Faction, cardId: string) {
  if (game.status !== 'in-progress') throw new Error('The game is not in progress.')
  const engine = new ChapterEngine(game.availableCards)
  const card = engine.removeCard(cardId)
  const player = { ...game.players[faction] }
  sellCard(player, card)
  return {
    ...game,
    players: { ...game.players, [faction]: player },
    availableCards: engine.cards,
    discardedCards: [...game.discardedCards, card],
  }
}

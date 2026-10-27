import type { Faction, GameState } from '../models'
import { ChapterEngine } from './chapterEngine'
import { createChapterLayout } from './chapterLayouts'
import { assertAction, drain, playCard } from './turnResolver'

export const takeChapterCard = (
  state: GameState,
  faction: Faction,
  id: string,
  sell = false,
  territoryId?: string,
) => {
  assertAction(state, faction)
  const game = structuredClone(state)
  const engine = new ChapterEngine(game.availableCards)
  const card = engine.removeCard(id)
  game.availableCards = engine.cards
  game.resolvingChapterCard = true
  if (sell) {
    game.players[faction].coinCount += game.chapter
    game.discardedCards.push(card)
  } else playCard(game, card, false, territoryId)
  return drain(game)
}
export const advanceChapter = (state: GameState) => {
  if (
    !state.chapterComplete ||
    state.chapter === 3 ||
    state.pendingChoice ||
    state.status !== 'in-progress'
  )
    throw new Error('Chapter is not complete.')
  const game = structuredClone(state)
  game.chapter = (game.chapter + 1) as 2 | 3
  const deal = createChapterLayout(game.chapter)
  game.availableCards = deal.cards
  game.discardedCards.push(...deal.discardedCards)
  while (game.landmarkMarket.length < 3 && game.landmarkReserve.length)
    game.landmarkMarket.push(game.landmarkReserve.shift()!)
  game.chapterComplete = false
  return game
}

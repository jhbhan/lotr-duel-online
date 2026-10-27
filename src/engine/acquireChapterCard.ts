import type { Faction, GameState } from '../models'
import { takeChapterCard } from './landMarks'
export const acquireChapterCard = (
  game: GameState,
  faction: Faction,
  cardId: string,
  territoryId?: string,
) => takeChapterCard(game, faction, cardId, false, territoryId)
export const sellChapterCard = (game: GameState, faction: Faction, cardId: string) =>
  takeChapterCard(game, faction, cardId, true)

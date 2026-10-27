import { landMarkDefinitions } from './landMarks'
import { createInitialTerritories } from './territories'
import { createChapterLayout } from '../engine/chapterLayouts'
import type { Faction, GameState, User } from '../models'

export function createInitialGameState() {
  const deal = createChapterLayout(1)
  const tiles = landMarkDefinitions.map((tile) => tile.id)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  const state: GameState = {
    landmarkMarket: tiles.slice(0, 3),
    landmarkReserve: tiles.slice(3),
    ownedLandmarks: { fellowship: [], sauron: [] },
    effectQueue: [],
    pendingChoice: null,
    chapterComplete: false,
    resolvingChapterCard: false,
    victoryReason: null,
    id: crypto.randomUUID(),
    status: 'setup',
    chapter: 1,
    territories: createInitialTerritories(),
    players: {
      fellowship: createPlayer('fellowship', 'The Fellowship'),
      sauron: createPlayer('sauron', 'Sauron'),
    },
    availableCards: deal.cards,
    discardedCards: deal.discardedCards,
    winnerId: null,
    currentPlayer: 'sauron',
  }

  return state
}

function createPlayer(faction: Faction, name: string) {
  const player: User = {
    id: crypto.randomUUID(),
    name,
    faction,
    ownedCards: [],
    resources: [],
    coinCount: faction === 'sauron' ? 2 : 3,
    ringJourney: 0,
    raceObtained: [],
    ownedChainSymbols: [],
    hasOptionalOne: false,
    hasOptionalTwo: false,
    hasOptionalAny: false,
  }
  return player
}

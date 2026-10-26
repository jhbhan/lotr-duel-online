import { createInitialTerritories } from '../data/territories'
import { createChapterLayout } from '../engine/chapterLayouts'
import type { ChapterCard } from '../engine/chapterEngine'

/** Domain models for the local game prototype. */
export type Faction = 'fellowship' | 'sauron'
export type Chapter = 1 | 2 | 3
export type GameStatus = 'setup' | 'in-progress' | 'finished'
export type ResourceType = 'courage' | 'ruse' | 'strength' | 'knowledge' | 'leadership'
export type CardType = 'resource' | 'gold' | 'military' | 'alliance' | 'ring'
export type Race = 'hobbit' | 'elf' | 'dwarf' | 'human' | 'ent' | 'wizard'
export type TerritoryName = 'Arnor' | 'Enedwaith' | 'Gondor' | 'Lindon' | 'Mordor' | 'Rohan' | 'Rhovanion'
export type TerritoryId = string
export type ChainSymbol = number

export interface User {
  id: string
  name: string
  faction: Faction

  ownedCards: Card[]

  resources: ResourceType[]
  coinCount: number
  ringJourney: number
  raceObtained: Race[]
  ownedChainSymbols: ChainSymbol[]
}

export interface UserResources {
  userId: User['id']
  coins: number
  /** Production available to the player; spending and trade rules are not implemented. */
  production: Record<ResourceType, number>
}

export interface Territory {
  id: TerritoryId
  name: TerritoryName
  adjacentTerritoryIds: TerritoryId[]

  unitType: Faction | null
  unitCount: number
  fortress: Faction | null
}

export interface Card {
  id: string
  chapter: Chapter

  type: CardType

  /* value is between 1 and 3 for military and ring cards */
  /* value is 1 or 2 for resource cards */
  /* value is 2 to 5 for gold cards */
  /* value is null for race cards */
  value: number
  resourceType: ResourceType | null
  race: Race | null

  chainSymbol: ChainSymbol | null

  /** Military cards let the player choose one of these territories. */
  territories: TerritoryId[]

  /** Cost to play the card, which may be a list of resources, a chain symbol, or a numeric value. */
  cost: ResourceType[] | ChainSymbol | number
}

export interface GameState {
  id: string
  status: GameStatus
  chapter: Chapter
  currentPlayer: Faction
  territories: Territory[]
  players: Record<Faction, User>
  availableCards: ChapterCard[]
  discardedCards: Card[]
  winnerId: User['id'] | null
}

export function createInitialGameState() {
  const deal = createChapterLayout(1)
  const state: GameState = {
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
  currentPlayer: "fellowship",
}

function createPlayer(faction: Faction, name: string) {
  const player: User = {
    id: crypto.randomUUID(), name, faction, ownedCards: [], resources: [],
    coinCount: 0, ringJourney: 0, raceObtained: [], ownedChainSymbols: [],
  }
  return player
}
  return state
}

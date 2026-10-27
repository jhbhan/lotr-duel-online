import type { ChapterCard } from '../engine/chapterEngine'

/** Domain models for the local game prototype. */
export type Faction = 'fellowship' | 'sauron'
export type Chapter = 1 | 2 | 3
export type GameStatus = 'setup' | 'in-progress' | 'finished'
export type ResourceType = 'courage' | 'ruse' | 'strength' | 'knowledge' | 'leadership'
export type CardType = 'resource' | 'gold' | 'military' | 'alliance' | 'ring'
export type Race = 'hobbit' | 'elf' | 'dwarf' | 'human' | 'ent' | 'wizard'
export type TerritoryName =
  'Arnor' | 'Enedwaith' | 'Gondor' | 'Lindon' | 'Mordor' | 'Rohan' | 'Rhovanion'
export type TerritoryId = string
export type ChainSymbol = number
export type SpecialEffect =
  'optional-resource-crs' | 'optional-resource-kl' | 'lose-coin' | 'remove-unit' | 'move-unit'

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

  hasOptionalOne: boolean
  hasOptionalTwo: boolean
  hasOptionalAny: boolean
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

  /** Resources and coins required to play the card. */
  cost: { resources: ResourceType[]; coins: number }

  /** */
  specialEffect?: SpecialEffect[]
}

export type Effect =
  | { type: 'fortress'; territoryId: string }
  | { type: 'units'; territoryId: string; count: number }
  | { type: 'coins' | 'ring'; count: number }
  | { type: 'movement' | 'discard-opponent' | 'discard-card' }
  | { type: 'military'; card: Card }
export type PendingChoice = Extract<
  Effect,
  { type: 'movement' | 'discard-opponent' | 'discard-card' | 'military' }
>
export type Choice =
  { cardId: string } | { territoryId: string } | { from: string; to: string } | { decline: true }

export interface GameState {
  landmarkReserve: string[]
  landmarkMarket: string[]
  ownedLandmarks: Record<Faction, string[]>
  effectQueue: Effect[]
  pendingChoice: PendingChoice | null
  chapterComplete: boolean
  resolvingChapterCard: boolean
  victoryReason: 'ring' | 'races' | 'territories' | 'final-territories' | 'shared' | null
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

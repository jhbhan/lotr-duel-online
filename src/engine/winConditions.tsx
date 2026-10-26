import type { Faction, Territory, User } from '../models'
import { hasCompletedRingJourney } from './ringHelper'

function hasPresence(territory: Territory, faction: Faction): boolean {
  return (
    (territory.unitType === faction && territory.unitCount > 0) ||
    territory.fortress === faction
  )
}

export function checkRingJourneyWin(user: User) {
  return hasCompletedRingJourney(user)
}

export function checkRaceWin(user: User): boolean {
  return new Set(user.raceObtained).size === 6
}

export function checkTerritoryWin(user: User, territories: Territory[]): boolean {
  const occupiedIds = new Set(
    territories.filter((territory) => hasPresence(territory, user.faction))
      .map((territory) => territory.id),
  )
  return occupiedIds.size === 7
}

/** Returns the current user's faction for an immediate victory, or null. */
export function checkWinConditions(user: User, territories: Territory[]): Faction | null {
  return (
    checkRingJourneyWin(user) ||
    checkRaceWin(user) ||
    checkTerritoryWin(user, territories)
  ) ? user.faction : null
}

/** Call at game end. Equal presence counts favor the current user's faction. */
export function checkFinalWinCondition(user: User, territories: Territory[]): Faction {
  const occupiedIds: Record<Faction, Set<Territory['id']>> = {
    fellowship: new Set(),
    sauron: new Set(),
  }

  for (const territory of territories) {
    for (const faction of ['fellowship', 'sauron'] as const) {
      if (hasPresence(territory, faction)) occupiedIds[faction].add(territory.id)
    }
  }

  if (occupiedIds.fellowship.size > occupiedIds.sauron.size) return 'fellowship'
  if (occupiedIds.sauron.size > occupiedIds.fellowship.size) return 'sauron'
  return user.faction
}

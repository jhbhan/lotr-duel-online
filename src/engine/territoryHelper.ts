import type { Faction, Territory } from "../models"

export const addUnitsToTerritory = (territory: Territory, unitType: Faction, unitCount: number) => {
    if (territory.unitType === unitType || territory.unitType === null) {
        territory.unitType = unitType
        territory.unitCount += unitCount
    } else {
        if (unitCount > territory.unitCount) {
            territory.unitType = unitType
            territory.unitCount = unitCount - territory.unitCount
        } else {
            territory.unitCount -= unitCount
            if (territory.unitCount === 0) territory.unitType = null
        }
    }
}

export const removeUnitsFromTerritory = (territory: Territory, unitCount: number) => {
    territory.unitCount -= unitCount
    if (territory.unitCount <= 0) {
        territory.unitType = null
        territory.unitCount = 0
    }
}

export const addFortressToTerritory = (territory: Territory, faction: Faction) => {
    if (territory.fortress) throw new Error('A fortress already occupies this territory.')
    territory.fortress = faction
}

export const removeFortressFromTerritory = (territory: Territory) => {
    territory.fortress = null
}

export const moveUnitsBetweenTerritories = (fromTerritory: Territory, toTerritory: Territory, unitCount: number) => {
    addUnitsToTerritory(toTerritory, fromTerritory.unitType!, unitCount)
    removeUnitsFromTerritory(fromTerritory, unitCount)
}

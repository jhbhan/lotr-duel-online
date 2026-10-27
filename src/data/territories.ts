import type { Territory, TerritoryName } from '../models'

export const territoryDefinitions: { id: string; name: TerritoryName }[] = [
  { id: 'lindon', name: 'Lindon' },
  { id: 'arnor', name: 'Arnor' },
  { id: 'rhovanion', name: 'Rhovanion' },
  { id: 'enedwaith', name: 'Enedwaith' },
  { id: 'rohan', name: 'Rohan' },
  { id: 'gondor', name: 'Gondor' },
  { id: 'mordor', name: 'Mordor' },
]

/** Undirected routes transcribed from the physical territory board. */
export const territoryConnections: [string, string][] = [
  ['lindon', 'arnor'],
  ['arnor', 'enedwaith'],
  ['arnor', 'rhovanion'],
  ['enedwaith', 'rhovanion'],
  ['enedwaith', 'rohan'],
  ['enedwaith', 'gondor'],
  ['rhovanion', 'rohan'],
  ['rohan', 'gondor'],
  ['rohan', 'mordor'],
  ['gondor', 'mordor'],
]

export function createInitialTerritories() {
  const territories: Territory[] = territoryDefinitions.map(({ id, name }) => ({
    id,
    name,
    adjacentTerritoryIds: territoryConnections.flatMap(([from, to]) =>
      from === id ? [to] : to === id ? [from] : [],
    ),
    unitType: null,
    unitCount: 0,
    fortress: null,
  }))
  return territories
}

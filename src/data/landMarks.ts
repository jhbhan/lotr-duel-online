import reference from '../../reference/landmarks-reference.json'
import type { ResourceType } from '../models'

export const landMarkDefinitions = reference.landmarks.map((tile) => ({
  id: tile.id,
  name: tile.name,
  territoryId: tile.territory.toLowerCase(),
  cost: Object.entries(tile.cost.resources).flatMap(([resource, count]) =>
    Array<ResourceType>(count).fill(resource as ResourceType),
  ),
  effects: tile.effects,
  supported: tile.id !== 'grey-havens',
}))

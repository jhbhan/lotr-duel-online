import catalog from './cards.json'
import type { Card, Race, ResourceType } from '../models'

export function createChapterOneDeck(random = Math.random) {
  const cards: Card[] = catalog.cards.map((entry) => {
    const effect = entry.effects[0]
    return {
      id: entry.id,
      chapter: 1,
      type: entry.type as Card['type'],
      value: 'amount' in effect ? effect.amount : 'steps' in effect ? effect.steps : 0,
      resourceType: 'resource' in effect ? (effect.resource as ResourceType) : null,
      race: 'race' in effect ? (effect.race as Race) : null,
      chainSymbol: entry.chainSymbol,
      cost: { resources: [...entry.cost.resources] as ResourceType[], coins: entry.cost.coins },
      territories: 'chooseTerritoryFrom' in effect ? [...effect.chooseTerritoryFrom] : [],
    }
  })

  for (let index = cards.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[cards[index], cards[other]] = [cards[other], cards[index]]
  }
  return cards
}

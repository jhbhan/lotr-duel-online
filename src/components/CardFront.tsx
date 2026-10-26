import type { Card } from '../models'
import { territoryDefinitions } from '../data/territories'

export function describeCard(card: Card) {
  if (card.type === 'resource') return `+${card.value} ${card.resourceType}`
  if (card.type === 'gold') return `+${card.value} coins`
  if (card.type === 'ring') return `+${card.value} Ring step${card.value === 1 ? '' : 's'}`
  if (card.type === 'alliance') return `${card.race} alliance`
  return `+${card.value} unit${card.value === 1 ? '' : 's'}`
}

export default function CardFront({ card, hideFreeCost = true }: { card: Card; hideFreeCost?: boolean }) {
  const territoryNames = card.territories.map(id => territoryDefinitions.find(territory => territory.id === id)?.name ?? id)
  const cost = Array.isArray(card.cost) ? card.cost.join(' + ') || 'Free' : card.cost > 0 ? `${card.cost} coin${card.cost === 1 ? '' : 's'}` : 'Free'
  return <span className={`card-face card-front card-front-${card.type}`}>
    <span className="card-effect">{describeCard(card)}</span>
    <span className="card-front-body">
      <span className="card-type-label">{card.type}</span>
      {territoryNames.length > 0 && <span className="card-territories">{territoryNames.join(' / ')}</span>}
    </span>
    <span className="card-cost">{hideFreeCost && cost === 'Free' ? '' : cost}</span>
  </span>
}

import type { Card } from '../models'
import { territoryDefinitions } from '../data/territories'

export function describeCard(card: Card) {
  if (card.type === 'resource') return `+${card.value} ${card.resourceType}`
  if (card.type === 'gold') return `+${card.value} coins`
  if (card.type === 'ring') return `+${card.value} Ring step${card.value === 1 ? '' : 's'}`
  if (card.type === 'alliance') return `${card.race} alliance`
  return `+${card.value} unit${card.value === 1 ? '' : 's'}`
}

function CardEffect({ card }: { card: Card }) {
  if (card.type === 'military') {
    return (
      <span className="effect-icon effect-shield" aria-hidden="true">
        {card.value}
      </span>
    )
  }
  if (card.type === 'alliance' && card.race) {
    return (
      <span className={`alliance-letter alliance-${card.race}`} aria-hidden="true">
        {card.race[0].toUpperCase()}
      </span>
    )
  }
  if (card.type === 'gold') {
    return (
      <span className="effect-icon effect-coin" aria-hidden="true">
        {card.value}
      </span>
    )
  }
  if (card.type === 'ring' || (card.type === 'resource' && card.resourceType)) {
    return Array.from({ length: card.value }, (_, index) => (
      <span
        key={index}
        aria-hidden="true"
        className={`effect-icon ${card.type === 'ring' ? 'effect-ring' : `effect-resource resource-${card.resourceType}`}`}
      />
    ))
  }
  return describeCard(card)
}

export default function CardFront({
  card,
  hideFreeCost = true,
}: {
  card: Card
  hideFreeCost?: boolean
}) {
  const territoryNames = card.territories.map(
    (id) => territoryDefinitions.find((territory) => territory.id === id)?.name ?? id,
  )
  const cost =
    [
      ...card.cost.resources,
      ...(card.cost.coins > 0
        ? [`${card.cost.coins} coin${card.cost.coins === 1 ? '' : 's'}`]
        : []),
    ].join(' + ') || 'Free'
  return (
    <span className={`card-face card-front card-front-${card.type}`}>
      <span
        className="card-effect"
        role="img"
        aria-label={describeCard(card)}
        title={describeCard(card)}
      >
        <CardEffect card={card} />
      </span>
      <span className="card-front-body">
        <span className="card-type-label">{card.type}</span>
        {territoryNames.length > 0 && (
          <span className="card-territories">{territoryNames.join(' / ')}</span>
        )}
      </span>
      <span className="card-cost">{hideFreeCost && cost === 'Free' ? '' : cost}</span>
    </span>
  )
}

import type { Card } from '../../models'
import CardFront, { describeCard } from '../CardFront'

export default function CardChoiceGrid({
  cards,
  onSelect,
}: {
  cards: Card[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="choice-cards">
      {cards.map((card) => (
        <button
          className="choice-card"
          key={card.id}
          aria-label={`Choose ${describeCard(card)}`}
          onClick={() => onSelect(card.id)}
        >
          <CardFront card={card} />
        </button>
      ))}
    </div>
  )
}

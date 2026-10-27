import type { Card } from '../../models'
import TerritoryChoices from './TerritoryChoices'
import Modal from './Modal'

export default function MilitaryTerritoryModal({
  card,
  onClose,
  onSelectTerritory,
}: {
  card: Card
  onClose: () => void
  onSelectTerritory: (territoryId: string) => void
}) {
  return (
    <Modal title="Choose a territory" onClose={onClose}>
      <p className="game-caption">
        Place {card.value} unit{card.value === 1 ? '' : 's'} in one of these territories.
      </p>
      <TerritoryChoices
        territoryIds={card.territories}
        units={card.value}
        onSelect={onSelectTerritory}
      />
    </Modal>
  )
}

import type { Card } from '../../models'
import { territoryDefinitions } from '../../data/territories'
import Modal from './Modal'

export default function MilitaryTerritoryModal({ card, onClose, onSelectTerritory }: {
  card: Card
  onClose: () => void
  onSelectTerritory: (territoryId: string) => void
}) {
  return <Modal title="Choose a territory" onClose={onClose}>
    <p className="game-caption">Place {card.value} unit{card.value === 1 ? '' : 's'} in one of these territories.</p>
    <div className="military-territory-choices">
      {card.territories.map(id => <button key={id} className="game-button" onClick={() => onSelectTerritory(id)}>
        {territoryDefinitions.find(territory => territory.id === id)?.name ?? id}
      </button>)}
    </div>
  </Modal>
}

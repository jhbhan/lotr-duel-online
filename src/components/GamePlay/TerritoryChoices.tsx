import { territoryDefinitions } from '../../data/territories'

export default function TerritoryChoices({
  territoryIds,
  units,
  onSelect,
}: {
  territoryIds: string[]
  units: number
  onSelect: (id: string) => void
}) {
  return (
    <div className="military-territory-choices">
      {territoryIds.map((id) => (
        <button
          className={`game-button territory-choice territory-${id}`}
          key={id}
          onClick={() => onSelect(id)}
        >
          <span className="effect-icon effect-shield" aria-hidden="true">
            {units}
          </span>{' '}
          {territoryDefinitions.find((territory) => territory.id === id)?.name ?? id}
        </button>
      ))}
    </div>
  )
}

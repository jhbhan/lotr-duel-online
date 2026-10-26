import type { Race, ResourceType, User } from '../../models'

const resources: ResourceType[] = ['strength', 'courage', 'ruse', 'leadership', 'knowledge']
const raceNames: Record<Race, string> = {
  dwarf: 'Dwarf', elf: 'Elf', hobbit: 'Hobbit', human: 'Human', ent: 'Ent', wizard: 'Wizard',
}

export function PlayerSummary({ label, player, onClick }: {
  label: string
  player: User
  onClick: () => void
}) {
  const races = [...new Set(player.raceObtained)]

  return (
    <section className="game-panel player-summary" aria-label={`${label} · ${player.name}`}>
      <div className="summary-heading"><strong>{label}</strong><span>{player.name}</span></div>
      <div className="summary-coins">Coins <b>{player.coinCount}</b></div>
      <div className="summary-section">
        <h3 className="summary-label">Resources</h3>
        <ResourceDisplay resources={player.resources} />
      </div>
      <div className="summary-section">
        <h3 className="summary-label">Alliance</h3>
        <div className="alliance-summary">
          {races.map(race => <span key={race} className={`alliance-letter alliance-${race}`}
            title={raceNames[race]} aria-label={raceNames[race]}>
            {raceNames[race][0]}
          </span>)}
          {races.length === 0 && <span className="alliance-empty">None yet</span>}
        </div>
      </div>
      <button className="game-button summary-cards-button" onClick={onClick}
        aria-label={`Cards · ${label === 'You' ? 'your' : 'opponent’s'} ${player.ownedCards.length} acquired cards`}>Cards</button>
    </section>
  )
}

export const ResourceDisplay = ({ resources: ownedResources }: { resources: ResourceType[] }) => (
  <div className="resource-summary" aria-label="Resource production">
    {resources.map(resource => {
      const count = ownedResources.filter(owned => owned === resource).length
      return <span key={resource} className={`resource-circle resource-${resource}${count === 0 ? ' resource-empty' : ''}`}
        title={`${resource}: ${count}`} aria-label={`${resource}: ${count}`}>{count}</span>
    })}
  </div>
)

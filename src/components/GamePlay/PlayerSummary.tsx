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
    <section className="game-panel player-summary" role="button" tabIndex={0}
      aria-label={`${label} · ${player.name} · View ${player.ownedCards.length} acquired cards`}
      aria-haspopup="dialog" onClick={onClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}>
      <div className="summary-heading"><strong>{label}</strong><span>{player.name}</span></div>
      <div className="summary-section">
        <h3 className="summary-label">Resources</h3>
        <ResourceDisplay resources={player.resources} coins={player.coinCount} />
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
    </section>
  )
}

export const ResourceDisplay = ({ resources: ownedResources, coins }: { resources: ResourceType[]; coins: number }) => (
  <div className="resource-summary" aria-label="Resources and coins">
    <span className="resource-circle resource-coin" title={`Coins: ${coins}`} aria-label={`Coins: ${coins}`}>{coins}</span>
    {resources.map(resource => {
      const count = ownedResources.filter(owned => owned === resource).length
      return <span key={resource} className={`resource-circle resource-${resource}${count === 0 ? ' resource-empty' : ''}`}
        title={`${resource}: ${count}`} aria-label={`${resource}: ${count}`}>{count}</span>
    })}
  </div>
)

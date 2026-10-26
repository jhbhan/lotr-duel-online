import type { Territory } from '../models'
import { territoryConnections } from '../data/territories'

const positions: Record<string, { x: number; y: number; color: string }> = {
  lindon: { x: 100, y: 75, color: '#4385a3' },
  arnor: { x: 330, y: 75, color: '#a38a50' },
  rhovanion: { x: 590, y: 75, color: '#7d974d' },
  enedwaith: { x: 235, y: 225, color: '#9c557f' },
  rohan: { x: 475, y: 225, color: '#4f926b' },
  gondor: { x: 330, y: 375, color: '#597da8' },
  mordor: { x: 590, y: 375, color: '#b45c46' },
}

export default function TerritoryMap({ territories }: { territories: Territory[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = territories.find(territory => territory.id === selectedId)
  const names = new Map(territories.map(territory => [territory.id, territory.name]))

  return (
    <div className="territory-map">
      <p className="game-caption">Select a territory to see its connections.</p>
      <svg viewBox="0 0 700 450" role="group" aria-label="Middle-earth territories and routes">
        <g className="territory-routes" aria-hidden="true">
          {territoryConnections.map(([from, to]) => {
            const start = positions[from]
            const end = positions[to]
            return <line key={`${from}-${to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              className={selectedId === from || selectedId === to ? 'selected-route' : ''} />
          })}
        </g>
        {territories.map(territory => {
          const position = positions[territory.id]
          if (!position) return null
          const active = territory.id === selectedId
          return <g key={territory.id} transform={`translate(${position.x},${position.y})`}
            className={`territory-node${active ? ' selected-territory' : ''}`} role="button" tabIndex={0}
            aria-label={`${territory.name}, ${territory.unitCount} units, ${territory.fortress ? `${territory.fortress} fortress` : 'no fortress'}`}
            aria-pressed={active} onClick={() => setSelectedId(territory.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSelectedId(territory.id)
              }
            }}>
            <rect x="-80" y="-36" width="160" height="72" rx="7" />
            <path d="M-65,-35 h18 v27 l-9,-6 -9,6 z" fill={position.color} aria-hidden="true" />
            <text className="territory-name" textAnchor="middle" y="0">{territory.name}</text>
            <text className="territory-presence" textAnchor="middle" y="21">{territory.unitCount} units · {territory.fortress ? 'Fortress' : 'No fortress'}</text>
          </g>
        })}
      </svg>
      <div className="territory-details" aria-live="polite">
        {selected ? <><strong>{selected.name}</strong><p>Connected to {selected.adjacentTerritoryIds.map(id => names.get(id)).join(', ')}.</p></>
          : <p>Seven territories · Ten routes</p>}
      </div>
    </div>
  )
}
import { useState } from 'react'

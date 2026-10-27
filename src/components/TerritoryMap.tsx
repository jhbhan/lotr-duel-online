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

const factionColors = {
  sauron: { fill: '#171315', stroke: '#d34a43' },
  fellowship: { fill: '#285b97', stroke: '#edca70' },
}

export default function TerritoryMap({ territories }: { territories: Territory[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = territories.find((territory) => territory.id === selectedId)
  const names = new Map(territories.map((territory) => [territory.id, territory.name]))

  return (
    <div className="territory-map">
      <p className="game-caption">Select a territory to see its connections.</p>
      <svg viewBox="0 0 700 450" role="group" aria-label="Middle-earth territories and routes">
        <g className="territory-routes" aria-hidden="true">
          {territoryConnections.map(([from, to]) => {
            const start = positions[from]
            const end = positions[to]
            return (
              <line
                key={`${from}-${to}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className={selectedId === from || selectedId === to ? 'selected-route' : ''}
              />
            )
          })}
        </g>
        {territories.map((territory) => {
          const position = positions[territory.id]
          if (!position) return null
          const active = territory.id === selectedId
          const fortressColors = territory.fortress ? factionColors[territory.fortress] : null
          const unitColors = territory.unitType ? factionColors[territory.unitType] : null
          const shieldSpacing = Math.min(19, 140 / Math.max(territory.unitCount, 1))
          return (
            <g
              key={territory.id}
              transform={`translate(${position.x},${position.y})`}
              className={`territory-node${active ? ' selected-territory' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${territory.name}, ${territory.unitCount} units, ${territory.fortress ? `${territory.fortress} fortress` : 'no fortress'}`}
              aria-pressed={active}
              onClick={() => setSelectedId(territory.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedId(territory.id)
                }
              }}
            >
              <rect x="-80" y="-36" width="160" height="72" rx="7" />
              <path
                d="M-65,-35 h18 v27 l-9,-6 -9,6 z"
                fill={fortressColors?.fill ?? position.color}
                stroke={fortressColors?.stroke ?? 'none'}
                strokeWidth="2"
                aria-hidden="true"
              />
              <text className="territory-name" textAnchor="middle" y="0">
                {territory.name}
              </text>
              {unitColors && (
                <g
                  aria-hidden="true"
                  fill={unitColors.fill}
                  stroke={unitColors.stroke}
                  strokeWidth="1.8"
                >
                  {Array.from({ length: territory.unitCount }, (_, index) => (
                    <path
                      key={index}
                      transform={`translate(${(index - (territory.unitCount - 1) / 2) * shieldSpacing},11) scale(${Math.min(1, shieldSpacing / 19)})`}
                      d="M-7,0 H7 L6,10 L3,14 L0,17 L-3,14 L-6,10 Z"
                    />
                  ))}
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
import { useState } from 'react'

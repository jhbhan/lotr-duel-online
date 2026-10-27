import type { ResourceType } from '../models'

const resourceSymbols: Record<ResourceType, string> = {
  strength: 'S',
  courage: 'C',
  ruse: 'R',
  knowledge: 'K',
  leadership: 'L',
}

export default function ResourceIcon({
  resource,
  count,
  className = '',
  showSymbol = true,
}: {
  resource: ResourceType
  count?: number
  className?: string
  showSymbol?: boolean
}) {
  return (
    <span
      className={`effect-icon effect-resource resource-${resource} ${className}`}
      role="img"
      aria-label={`${resource}${count === undefined ? '' : `: ${count}`}`}
      title={`${resource}${count === undefined ? '' : `: ${count}`}`}
    >
      {showSymbol && <span>{resourceSymbols[resource]}</span>}
      {count !== undefined && <b>{count}</b>}
    </span>
  )
}

import type { Territory } from '../../models'
import TerritoryMap from '../TerritoryMap'
import Modal from './Modal'

export default function TerritoryMapModal({
  territories,
  onClose,
}: {
  territories: Territory[]
  onClose: () => void
}) {
  return (
    <Modal title="Territory map" onClose={onClose}>
      <TerritoryMap territories={territories} />
    </Modal>
  )
}

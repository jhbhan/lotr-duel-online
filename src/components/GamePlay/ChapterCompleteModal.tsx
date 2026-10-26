import type { Chapter } from '../../models'
import Modal from './Modal'

export default function ChapterCompleteModal({ chapter, onClose, onAdvance }: {
  chapter: Chapter
  onClose: () => void
  onAdvance: () => void
}) {
  return <Modal title={`Chapter ${chapter} complete`} onClose={onClose} dismissible={false}>
    <div className="finished-placeholder">
      <span aria-hidden="true">✧</span>
      <p>All chapter cards have been taken.</p>
      <button className="begin-button" onClick={onAdvance}>
        Go to next chapter <span aria-hidden="true">→</span>
      </button>
    </div>
  </Modal>
}

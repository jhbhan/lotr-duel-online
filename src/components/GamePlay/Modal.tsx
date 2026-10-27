import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export default function Modal({
  title,
  children,
  onClose,
  dismissible = true,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  dismissible?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current!
    if (!element.open) element.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="game-modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        if (!dismissible) event.preventDefault()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) dialog.current?.close()
      }}
    >
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        {dismissible && (
          <button
            className="game-button"
            onClick={() => dialog.current?.close()}
            aria-label="Close dialog"
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </dialog>
  )
}

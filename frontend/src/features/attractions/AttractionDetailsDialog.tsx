import { useEffect, useRef } from 'react'
import type { RomeAttraction } from '../../shared/api/romeAttractions'
import type { RomeBookingPriority } from '../../shared/api/romeBookingPriorities'
import type { RomePlace } from '../../shared/api/romePlaces'
import { AttractionEvidenceDetails } from './AttractionEvidenceDetails'
import { attractionName, priorityCopy } from './resultPresentation'

export function AttractionDetailsDialog({
  attraction,
  onClose,
  places,
  priority,
  stayStartDate,
}: {
  attraction?: RomeAttraction
  onClose: () => void
  places: RomePlace[]
  priority?: RomeBookingPriority
  stayStartDate: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const name = attractionName(attraction, places, priority)
  const priorityTone =
    priority?.priority.toLowerCase().replaceAll('_', '-') ?? 'unavailable'

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement
    if (!dialog) return

    if (typeof dialog.showModal === 'function') {
      dialog.showModal()
    } else {
      dialog.setAttribute('open', '')
    }
    return () => {
      dialog.removeAttribute('open')
      if (trigger instanceof HTMLElement) trigger.focus()
    }
  }, [])

  return (
    <dialog
      aria-labelledby="attraction-dialog-title"
      className="attraction-dialog"
      onCancel={onClose}
      ref={dialogRef}
    >
      <div className="attraction-dialog-shell">
        <header className="attraction-dialog-header">
          <div>
            <span className={`booking-priority-badge priority-${priorityTone}`}>
              {priority
                ? priorityCopy(priority.priority)
                : 'Priority unavailable'}
            </span>
            <h2 id="attraction-dialog-title">{name}</h2>
          </div>
          <button
            aria-label={`Close details for ${name}`}
            className="attraction-dialog-close"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <AttractionEvidenceDetails
          attraction={attraction}
          places={places}
          priority={priority}
          stayStartDate={stayStartDate}
        />
      </div>
    </dialog>
  )
}

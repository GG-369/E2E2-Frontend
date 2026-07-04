import type { Trip } from '../types'
import { formatDate, fullName } from '../utils'
import { StatusBadge } from './StatusBadge'

interface Props {
  trip: Trip
  role: 'PASSENGER' | 'DRIVER'
  onOpen: (trip: Trip) => void
  canOpen?: boolean
  actionLabel?: string
  onAction?: (trip: Trip) => void
  actionDisabled?: boolean
}

export function TripCard({
  trip,
  role,
  onOpen,
  canOpen = true,
  actionLabel,
  onAction,
  actionDisabled,
}: Props) {
  const otherPerson = role === 'PASSENGER' ? trip.driver : trip.passenger

  return (
    <article className="trip-card">
      <div className="trip-card-header">
        <div>
          <p className="eyebrow">Viaje #{trip.id}</p>
          <h3>{trip.pickupAddress}</h3>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="trip-route">
        <span>Origen</span>
        <strong>{trip.pickupAddress}</strong>
        <span>Destino</span>
        <strong>{trip.dropoffAddress}</strong>
      </div>

      <div className="trip-meta">
        <p>
          {role === 'PASSENGER' ? 'Conductor' : 'Pasajero'}:{' '}
          {otherPerson ? fullName(otherPerson) : role === 'PASSENGER' ? 'Buscando conductor' : 'Sin asignar'}
        </p>
        <p>Solicitado: {formatDate(trip.requestedAt)}</p>
      </div>

      <div className="actions">
        {canOpen && (
          <button type="button" className="secondary" onClick={() => onOpen(trip)}>
            Ver detalle
          </button>
        )}
        {actionLabel && onAction && (
          <button type="button" onClick={() => onAction(trip)} disabled={actionDisabled}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { StatusBadge } from '../components/StatusBadge'
import type { FormEvent } from 'react'
import type { Role, Trip } from '../types'
import { formatDate, fullName } from '../utils'

interface Props {
  tripId: number
  role: Role
  onBack: () => void
  onUpdated: () => Promise<void>
}

export function TripDetail({ tripId, role, onBack, onUpdated }: Props) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }

    try {
      const data = await api.trip(tripId)
      setTrip(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const pollingTripId = trip?.id
  const pollingStatus = trip?.status

  useEffect(() => {
    if (!pollingTripId || pollingStatus === 'COMPLETED') return

    const interval = window.setInterval(() => {
      load(true)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [load, pollingTripId, pollingStatus])

  async function completeTrip() {
    if (!trip) return

    setSaving(true)
    setError('')

    try {
      const updated = await api.completeTrip(trip.id)
      setTrip(updated)
      await onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el viaje')
    } finally {
      setSaving(false)
    }
  }

  async function rateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trip) return

    setSaving(true)
    setError('')

    try {
      const updated = await api.rateTrip(trip.id, { rating, comment })
      setTrip(updated)
      await onUpdated()
      setComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calificar el viaje')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <p className="muted">Cargando detalle...</p>
      </main>
    )
  }

  if (!trip) {
    return (
      <main className="app-shell">
        <button type="button" className="secondary" onClick={onBack}>
          Volver
        </button>
        {error && <p className="error">{error}</p>}
      </main>
    )
  }

  const canComplete = role === 'DRIVER' && trip.status === 'IN_PROGRESS'
  const canRate = role === 'PASSENGER' && trip.status === 'COMPLETED' && trip.passengerRating === null

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Detalle de viaje</p>
          <h1>Viaje #{trip.id}</h1>
        </div>
        <button type="button" className="secondary" onClick={onBack}>
          Volver al panel
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="panel detail-panel">
        <div className="detail-heading">
          <StatusBadge status={trip.status} />
          {trip.status !== 'COMPLETED' && <span className="muted">Actualizacion automatica cada 4 segundos</span>}
        </div>

        <div className="detail-grid">
          <div>
            <p className="eyebrow">Origen</p>
            <h2>{trip.pickupAddress}</h2>
          </div>
          <div>
            <p className="eyebrow">Destino</p>
            <h2>{trip.dropoffAddress}</h2>
          </div>
          <div>
            <p className="eyebrow">Pasajero</p>
            <p>{fullName(trip.passenger)}</p>
          </div>
          <div>
            <p className="eyebrow">Conductor</p>
            <p>{trip.driver ? `${fullName(trip.driver)} · ${trip.driver.rating.toFixed(1)} estrellas` : 'Buscando conductor...'}</p>
          </div>
          <div>
            <p className="eyebrow">Solicitado</p>
            <p>{formatDate(trip.requestedAt)}</p>
          </div>
          <div>
            <p className="eyebrow">Aceptado</p>
            <p>{formatDate(trip.acceptedAt)}</p>
          </div>
          <div>
            <p className="eyebrow">Completado</p>
            <p>{formatDate(trip.completedAt)}</p>
          </div>
          <div>
            <p className="eyebrow">Calificacion</p>
            <p>{trip.passengerRating ? `${trip.passengerRating}/5 · ${trip.ratingComment || 'Sin comentario'}` : 'Pendiente'}</p>
          </div>
        </div>

        {canComplete && (
          <div className="detail-action">
            <h2>Finalizar viaje</h2>
            <p className="muted">Cuando el viaje termine, el conductor vuelve a estar disponible.</p>
            <button type="button" onClick={completeTrip} disabled={saving}>
              {saving ? 'Completando...' : 'Marcar como completado'}
            </button>
          </div>
        )}

        {canRate && (
          <form className="detail-action" onSubmit={rateTrip}>
            <h2>Calificar conductor</h2>
            <label>
              Estrellas
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                <option value={5}>5 estrellas</option>
                <option value={4}>4 estrellas</option>
                <option value={3}>3 estrellas</option>
                <option value={2}>2 estrellas</option>
                <option value={1}>1 estrella</option>
              </select>
            </label>
            <label>
              Comentario
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? 'Enviando...' : 'Enviar calificacion'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

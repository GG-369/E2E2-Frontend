import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { EmptyState } from '../components/EmptyState'
import { TripCard } from '../components/TripCard'
import { TripFilter } from '../components/TripFilter'
import type { Trip, TripStatus, User } from '../types'
import { filterTrips } from '../utils'

interface Props {
  user: User
  onLogout: () => void
  onOpenTrip: (trip: Trip) => void
  onUserRefresh: () => Promise<void>
}

export function DriverDashboard({ user, onLogout, onOpenTrip, onUserRefresh }: Props) {
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([])
  const [myTrips, setMyTrips] = useState<Trip[]>([])
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [workingTripId, setWorkingTripId] = useState<number | null>(null)

  async function load() {
    setError('')
    setLoading(true)

    try {
      const [pendingData, myData] = await Promise.all([
        api.pendingTrips(),
        api.driverTrips(),
      ])
      setPendingTrips(pendingData)
      setMyTrips(myData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activeTrip = myTrips.find((trip) => trip.status === 'IN_PROGRESS')
  const visibleTrips = useMemo(() => filterTrips(myTrips, filter), [myTrips, filter])

  async function acceptTrip(trip: Trip) {
    setError('')
    setWorkingTripId(trip.id)

    try {
      const updated = await api.acceptTrip(trip.id)
      setPendingTrips((current) => current.filter((item) => item.id !== trip.id))
      setMyTrips((current) => [updated, ...current])
      await onUserRefresh()
      onOpenTrip(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aceptar el viaje')
      await load()
      await onUserRefresh()
    } finally {
      setWorkingTripId(null)
    }
  }

  async function completeTrip(trip: Trip) {
    setError('')
    setWorkingTripId(trip.id)

    try {
      const updated = await api.completeTrip(trip.id)
      setMyTrips((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      await onUserRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el viaje')
      await load()
      await onUserRefresh()
    } finally {
      setWorkingTripId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel conductor</p>
          <h1>Hola, {user.firstName}</h1>
          <p className="muted">
            Estado: {user.available ? 'Disponible' : 'Ocupado'} · Rating {user.rating.toFixed(1)}
          </p>
        </div>
        <button type="button" className="secondary" onClick={onLogout}>
          Cerrar sesion
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="grid two-columns">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Viajes pendientes</p>
              <h2>Solicitudes disponibles</h2>
            </div>
            <button type="button" className="secondary" onClick={load}>
              Actualizar
            </button>
          </div>

          {loading ? (
            <p className="muted">Cargando viajes...</p>
          ) : pendingTrips.length === 0 ? (
            <EmptyState title="Sin solicitudes pendientes" text="Cuando un pasajero cree un viaje, aparecera aqui." />
          ) : (
            <div className="stack">
              {pendingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  role="DRIVER"
                  onOpen={onOpenTrip}
                  canOpen={false}
                  actionLabel="Aceptar"
                  onAction={acceptTrip}
                  actionDisabled={!user.available || workingTripId === trip.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Mi actividad</p>
              <h2>Viajes aceptados</h2>
            </div>
          </div>

          {activeTrip && (
            <div className="notice">
              <span>Tienes un viaje en curso: #{activeTrip.id}.</span>
              <button type="button" onClick={() => completeTrip(activeTrip)} disabled={workingTripId === activeTrip.id}>
                {workingTripId === activeTrip.id ? 'Completando...' : 'Completar viaje'}
              </button>
            </div>
          )}

          <TripFilter value={filter} onChange={setFilter} />

          {loading ? (
            <p className="muted">Cargando historial...</p>
          ) : visibleTrips.length === 0 ? (
            <EmptyState title="Sin viajes para este filtro" text="Acepta una solicitud para iniciar tu historial." />
          ) : (
            <div className="stack">
              {visibleTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  role="DRIVER"
                  onOpen={onOpenTrip}
                  actionLabel={trip.status === 'IN_PROGRESS' ? 'Completar' : undefined}
                  onAction={trip.status === 'IN_PROGRESS' ? completeTrip : undefined}
                  actionDisabled={workingTripId === trip.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

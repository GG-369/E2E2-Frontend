import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { EmptyState } from '../components/EmptyState'
import { TripCard } from '../components/TripCard'
import { TripFilter } from '../components/TripFilter'
import type { FormEvent } from 'react'
import type { Trip, TripStatus, User } from '../types'
import { filterTrips, fullName } from '../utils'

interface Props {
  user: User
  onLogout: () => void
  onOpenTrip: (trip: Trip) => void
}

export function PassengerDashboard({ user, onLogout, onOpenTrip }: Props) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [drivers, setDrivers] = useState<User[]>([])
  const [pickupAddress, setPickupAddress] = useState('UTEC, Barranco')
  const [dropoffAddress, setDropoffAddress] = useState('Miraflores, Lima')
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    setError('')
    setLoading(true)

    try {
      const [tripData, driverData] = await Promise.all([
        api.passengerTrips(),
        api.availableDrivers(),
      ])
      setTrips(tripData)
      setDrivers(driverData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visibleTrips = useMemo(() => filterTrips(trips, filter), [trips, filter])

  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setCreating(true)

    try {
      const trip = await api.createTrip({ pickupAddress, dropoffAddress })
      setTrips((current) => [trip, ...current])
      onOpenTrip(trip)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo solicitar el viaje')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel pasajero</p>
          <h1>Hola, {user.firstName}</h1>
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
              <p className="eyebrow">Nuevo viaje</p>
              <h2>Solicitar movilidad</h2>
            </div>
            <button type="button" className="secondary" onClick={load}>
              Actualizar
            </button>
          </div>

          <form onSubmit={createTrip}>
            <label>
              Punto de partida
              <input value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} required />
            </label>
            <label>
              Destino
              <input value={dropoffAddress} onChange={(event) => setDropoffAddress(event.target.value)} required />
            </label>
            <button type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Solicitar viaje'}
            </button>
          </form>

          <div className="driver-list">
            <p className="eyebrow">Conductores disponibles</p>
            {drivers.length === 0 ? (
              <p className="muted">No hay conductores disponibles por ahora.</p>
            ) : (
              drivers.map((driver) => (
                <div className="driver-row" key={driver.id}>
                  <span>{fullName(driver)}</span>
                  <strong>{driver.rating.toFixed(1)} estrellas</strong>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Historial</p>
              <h2>Mis viajes</h2>
            </div>
          </div>
          <TripFilter value={filter} onChange={setFilter} />

          {loading ? (
            <p className="muted">Cargando viajes...</p>
          ) : visibleTrips.length === 0 ? (
            <EmptyState title="Sin viajes para este filtro" text="Cambia el filtro o solicita un nuevo viaje." />
          ) : (
            <div className="stack">
              {visibleTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} role="PASSENGER" onOpen={onOpenTrip} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

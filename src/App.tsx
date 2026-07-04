import { useEffect, useState } from 'react'
import { api } from './api'
import { AuthPage } from './pages/AuthPage'
import { DriverDashboard } from './pages/DriverDashboard'
import { PassengerDashboard } from './pages/PassengerDashboard'
import { TripDetail } from './pages/TripDetail'
import type { Trip, User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [booting, setBooting] = useState(true)
  const [error, setError] = useState('')

  async function loadUser() {
    const profile = await api.me()
    setUser(profile)
  }

  async function handleAuth(token: string) {
    localStorage.setItem('token', token)
    await loadUser()
    setSelectedTripId(null)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    setSelectedTripId(null)
  }

  function openTrip(trip: Trip) {
    setSelectedTripId(trip.id)
  }

  useEffect(() => {
    async function boot() {
      if (!localStorage.getItem('token')) {
        setBooting(false)
        return
      }

      try {
        await loadUser()
      } catch (err) {
        localStorage.removeItem('token')
        setError(err instanceof Error ? err.message : 'Sesion expirada')
      } finally {
        setBooting(false)
      }
    }

    boot()
  }, [])

  if (booting) {
    return (
      <main className="app-shell">
        <p className="muted">Preparando aplicacion...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <>
        {error && <p className="global-error">{error}</p>}
        <AuthPage onAuth={handleAuth} />
      </>
    )
  }

  if (selectedTripId) {
    return (
      <TripDetail
        tripId={selectedTripId}
        role={user.role}
        onBack={() => setSelectedTripId(null)}
        onUpdated={loadUser}
      />
    )
  }

  if (user.role === 'PASSENGER') {
    return <PassengerDashboard user={user} onLogout={logout} onOpenTrip={openTrip} />
  }

  return (
    <DriverDashboard
      user={user}
      onLogout={logout}
      onOpenTrip={openTrip}
      onUserRefresh={loadUser}
    />
  )
}

export default App

import type { Trip, TripStatus } from './types'

export const statusLabels: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
}

export function fullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`
}

export function formatDate(value: string | null) {
  if (!value) return 'Aun no registrado'

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function filterTrips(trips: Trip[], status: TripStatus | 'ALL') {
  if (status === 'ALL') return trips

  return trips.filter((trip) => trip.status === status)
}

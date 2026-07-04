import type {
  CreateTripPayload,
  LoginPayload,
  RateTripPayload,
  RegisterPayload,
  Trip,
  User,
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

interface AuthResponse {
  token: string
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token: string | null = localStorage.getItem('token'),
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`

    try {
      const data = await response.json()
      message = data.error ?? Object.values(data).join(', ') ?? message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  return response.json()
}

export const api = {
  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, null)
  },
  register(payload: RegisterPayload) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, null)
  },
  me() {
    return request<User>('/users/me')
  },
  availableDrivers() {
    return request<User[]>('/drivers/available')
  },
  createTrip(payload: CreateTripPayload) {
    return request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  passengerTrips() {
    return request<Trip[]>('/trips')
  },
  pendingTrips() {
    return request<Trip[]>('/trips/pending')
  },
  driverTrips() {
    return request<Trip[]>('/trips/my')
  },
  trip(id: number) {
    return request<Trip>(`/trips/${id}`)
  },
  acceptTrip(id: number) {
    return request<Trip>(`/trips/${id}/accept`, {
      method: 'PATCH',
    })
  },
  completeTrip(id: number) {
    return request<Trip>(`/trips/${id}/complete`, {
      method: 'PATCH',
    })
  },
  rateTrip(id: number, payload: RateTripPayload) {
    return request<Trip>(`/trips/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

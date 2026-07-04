import { useState } from 'react'
import { api } from '../api'
import type { FormEvent } from 'react'
import type { Role } from '../types'

interface Props {
  onAuth: (token: string) => Promise<void>
}

const accounts = [
  { label: 'Ana pasajera', email: 'ana@uber.com', password: 'pass123' },
  { label: 'Carlos conductor', email: 'carlos@uber.com', password: 'pass123' },
  { label: 'Pedro conductor', email: 'pedro@uber.com', password: 'pass123' },
]

export function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('ana@uber.com')
  const [password, setPassword] = useState('pass123')
  const [role, setRole] = useState<Role>('PASSENGER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = mode === 'login'
        ? await api.login({ email, password })
        : await api.register({ firstName, lastName, email, password, role })

      await onAuth(response.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la autenticacion')
    } finally {
      setLoading(false)
    }
  }

  function selectAccount(account: { email: string; password: string }) {
    setMode('login')
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">CS2031 DBP</p>
        <h1>Uber Clone E2E</h1>
        <p>
          Frontend React conectado al backend Spring Boot con JWT, roles, viajes,
          estados y calificacion.
        </p>
      </section>

      <section className="panel auth-panel">
        <div className="tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Registro
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-grid two">
              <label>
                Nombre
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </label>
              <label>
                Apellido
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </label>
            </div>
          )}

          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {mode === 'register' && (
            <label>
              Rol
              <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="PASSENGER">Pasajero</option>
                <option value="DRIVER">Conductor</option>
              </select>
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="quick-access">
          <p className="eyebrow">Usuarios de prueba</p>
          {accounts.map((account) => (
            <button type="button" className="secondary" key={account.email} onClick={() => selectAccount(account)}>
              {account.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

import type { TripStatus } from '../types'

interface Props {
  value: TripStatus | 'ALL'
  onChange: (value: TripStatus | 'ALL') => void
}

export function TripFilter({ value, onChange }: Props) {
  return (
    <div className="segmented" aria-label="Filtrar historial por estado">
      <button type="button" className={value === 'ALL' ? 'active' : ''} onClick={() => onChange('ALL')}>
        Todos
      </button>
      <button type="button" className={value === 'PENDING' ? 'active' : ''} onClick={() => onChange('PENDING')}>
        Pendientes
      </button>
      <button type="button" className={value === 'IN_PROGRESS' ? 'active' : ''} onClick={() => onChange('IN_PROGRESS')}>
        En curso
      </button>
      <button type="button" className={value === 'COMPLETED' ? 'active' : ''} onClick={() => onChange('COMPLETED')}>
        Completados
      </button>
    </div>
  )
}

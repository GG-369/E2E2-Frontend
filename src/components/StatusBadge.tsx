import type { TripStatus } from '../types'
import { statusLabels } from '../utils'

interface Props {
  status: TripStatus
}

export function StatusBadge({ status }: Props) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{statusLabels[status]}</span>
}

// components/StatusBadge.tsx
import clsx from 'clsx'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import type { ProjectStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        STATUS_COLORS[status],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

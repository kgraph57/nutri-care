import { type ReactNode } from 'react'
import styles from './Badge.module.css'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  readonly variant?: BadgeVariant
  readonly children: ReactNode
  readonly className?: string
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return <span className={classNames}>{children}</span>
}

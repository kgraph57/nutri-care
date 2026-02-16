import { type ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  readonly icon?: ReactNode
  readonly title: string
  readonly description?: string
  readonly action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

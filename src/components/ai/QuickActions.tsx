import type { QuickAction } from '../../services/aiChatService'
import styles from './QuickActions.module.css'

interface QuickActionsProps {
  readonly actions: readonly QuickAction[]
  readonly onSelect: (action: QuickAction) => void
  readonly disabled?: boolean
}

export function QuickActions({
  actions,
  onSelect,
  disabled = false,
}: QuickActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className={styles.container} role="group" aria-label="クイックアクション">
      <div className={styles.scrollArea}>
        {actions.map((action) => (
          <button
            key={action.id}
            className={styles.pill}
            onClick={() => onSelect(action)}
            disabled={disabled}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

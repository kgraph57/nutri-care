import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { type ToastItem } from './useToast'
import styles from './Toast.module.css'

interface ToastProps {
  readonly toast: ToastItem
  readonly onRemove: (id: string) => void
}

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

function ToastSingle({ toast, onRemove }: ToastProps) {
  const Icon = ICON_MAP[toast.type]

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
      <span className={styles.iconWrapper}>
        <Icon size={18} />
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.closeButton}
        onClick={() => onRemove(toast.id)}
        aria-label="閉じる"
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  readonly toasts: readonly ToastItem[]
  readonly onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastSingle key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

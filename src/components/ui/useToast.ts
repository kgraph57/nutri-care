import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  readonly id: string
  readonly type: ToastType
  readonly message: string
}

interface AddToastParams {
  readonly type: ToastType
  readonly message: string
}

interface UseToastReturn {
  readonly toasts: readonly ToastItem[]
  readonly addToast: (params: AddToastParams) => void
  readonly removeToast: (id: string) => void
}

let toastCounter = 0

function generateId(): string {
  toastCounter += 1
  return `toast-${Date.now()}-${toastCounter}`
}

const AUTO_DISMISS_MS = 3000

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type, message }: AddToastParams) => {
      const id = generateId()
      const newToast: ToastItem = { id, type, message }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, AUTO_DISMISS_MS)
    },
    [removeToast]
  )

  return { toasts, addToast, removeToast }
}

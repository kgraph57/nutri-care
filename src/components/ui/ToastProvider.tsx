import { createContext, useContext, type ReactNode } from 'react'
import { useToast, type ToastType } from './useToast'
import { ToastContainer } from './Toast'

interface ToastContextValue {
  readonly addToast: (params: { type: ToastType; message: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

interface ToastProviderProps {
  readonly children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext は ToastProvider 内で使用してください')
  }

  return context
}

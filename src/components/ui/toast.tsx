'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (type: ToastType, message: string, duration?: number) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg',
        'animate-in slide-in-from-top-2 fade-in duration-200',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', iconStyles[toast.type])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, type, message, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-lg mx-auto">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => dismissToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { showToast } = useToast()
  return useCallback((message: string) => showToast('success', message), [showToast])
}

export function useErrorToast() {
  const { showToast } = useToast()
  return useCallback((message: string) => showToast('error', message), [showToast])
}

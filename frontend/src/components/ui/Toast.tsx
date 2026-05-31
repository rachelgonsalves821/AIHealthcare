import * as RadixToast from '@radix-ui/react-toast'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { XMarkIcon, CheckIcon, AlertTriangleIcon, InfoIcon } from './icons'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, { container: string; icon: ReactNode }> = {
  success: {
    container: 'border-green-200 bg-green-50',
    icon: <CheckIcon className="h-5 w-5 text-success" />,
  },
  error: {
    container: 'border-red-200 bg-red-50',
    icon: <AlertTriangleIcon className="h-5 w-5 text-error" />,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50',
    icon: <AlertTriangleIcon className="h-5 w-5 text-warning" />,
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: <InfoIcon className="h-5 w-5 text-blue-500" />,
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback(
    ({ title, description, variant = 'info' }: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, title, description, variant }])
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => {
          const style = variantStyles[t.variant]
          return (
            <RadixToast.Root
              key={t.id}
              open={true}
              onOpenChange={(open) => { if (!open) dismiss(t.id) }}
              duration={4000}
              className={[
                'flex items-start gap-3 p-4 rounded-lg border shadow-md',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
                'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
                'max-w-sm w-full',
                style.container,
              ].join(' ')}
            >
              <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
              <div className="flex-1 min-w-0">
                <RadixToast.Title className="text-sm font-semibold text-ink">{t.title}</RadixToast.Title>
                {t.description && (
                  <RadixToast.Description className="text-xs text-muted mt-1">
                    {t.description}
                  </RadixToast.Description>
                )}
              </div>
              <RadixToast.Close
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 text-muted hover:text-ink"
              >
                <XMarkIcon className="h-4 w-4" />
              </RadixToast.Close>
            </RadixToast.Root>
          )
        })}
        <RadixToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-[100] max-h-screen w-[390px]" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export type { ToastVariant, ToastMessage }

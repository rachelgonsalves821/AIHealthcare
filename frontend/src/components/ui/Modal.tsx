import * as Dialog from '@radix-ui/react-dialog'
import { ReactNode } from 'react'
import { XMarkIcon } from './icons'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

function Modal({ open, onOpenChange, title, description, children, footer, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={[
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'bg-white rounded-lg shadow-lg w-full mx-4',
            sizeClasses[size],
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          ].join(' ')}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <XMarkIcon className="h-5 w-5 text-muted" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {description && (
              <Dialog.Description className="text-sm text-muted mb-4">
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>

          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
export type { ModalProps }

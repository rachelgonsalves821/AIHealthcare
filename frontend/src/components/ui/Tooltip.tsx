import * as RadixTooltip from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
}

function Tooltip({ content, children, disabled = false, side = 'top' }: TooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={4}
            className={[
              'z-50 px-3 py-1.5 text-xs font-medium',
              'bg-gray-900 text-white rounded-md shadow-md',
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            ].join(' ')}
          >
            {content}
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}

export default Tooltip
export type { TooltipProps }

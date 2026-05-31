import * as RadixTabs from '@radix-ui/react-tabs'
import { ReactNode } from 'react'

interface TabItem {
  value: string
  label: string
  content: ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

function Tabs({ items, defaultValue, value, onValueChange, className = '' }: TabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={['flex flex-col', className].join(' ')}
    >
      <RadixTabs.List className="flex border-b border-gray-200 -mb-px">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              'data-[state=active]:border-teal data-[state=active]:text-teal',
              'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted',
              'hover:text-ink hover:border-gray-300 focus:outline-none',
            ].join(' ')}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value} className="flex-1 pt-4">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}

export default Tabs
export type { TabsProps, TabItem }

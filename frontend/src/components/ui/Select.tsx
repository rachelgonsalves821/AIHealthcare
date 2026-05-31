import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDownIcon, CheckIcon } from './icons'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  error?: string
  disabled?: boolean
  id?: string
}

function Select({ label, placeholder = 'Select...', options, value, onValueChange, error, disabled, id }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={inputId}
          className={[
            'flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            value ? 'text-ink' : 'text-muted',
            error ? 'border-error' : 'border-gray-300',
          ].join(' ')}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDownIcon className="h-4 w-4 text-muted" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 min-w-[180px] bg-white rounded-md border border-gray-200 shadow-lg overflow-hidden"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={[
                    'flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer',
                    'text-ink hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    'data-[highlighted]:bg-gray-100',
                  ].join(' ')}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <CheckIcon className="h-4 w-4 text-teal" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

export default Select
export type { SelectProps, SelectOption }

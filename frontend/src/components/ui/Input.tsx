import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'block w-full rounded-md border px-3 py-2 text-sm text-ink',
            'placeholder:text-muted',
            'focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error
              ? 'border-error focus:ring-error'
              : 'border-gray-300',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
export type { InputProps }

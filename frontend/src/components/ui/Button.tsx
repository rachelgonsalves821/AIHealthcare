import { forwardRef, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-teal text-white hover:bg-teal-600 focus:ring-teal-500 border border-transparent disabled:bg-gray-400',
  secondary:
    'bg-white text-ink border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100',
  ghost: 'bg-transparent text-ink hover:bg-gray-100 focus:ring-gray-500 border border-transparent disabled:opacity-50',
  danger:
    'bg-error text-white hover:bg-red-700 focus:ring-red-500 border border-transparent disabled:bg-gray-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, children, className = '', ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'transition-colors duration-150',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
export type { ButtonProps, ButtonVariant, ButtonSize }

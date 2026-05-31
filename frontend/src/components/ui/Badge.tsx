import { ReactNode } from 'react'

type BadgeVariant =
  | 'gray'
  | 'blue'
  | 'teal'
  | 'purple'
  | 'amber'
  | 'orange'
  | 'indigo'
  | 'green'
  | 'red'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  gray: 'bg-gray-100 text-gray-700 border-gray-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  teal: 'bg-teal-100 text-teal-700 border-teal-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  red: 'bg-red-100 text-red-700 border-red-300',
}

function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default Badge
export type { BadgeProps, BadgeVariant }

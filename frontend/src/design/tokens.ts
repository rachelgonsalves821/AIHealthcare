export const colors = {
  ink: '#16202e',
  paper: '#f7f4ee',
  teal: {
    DEFAULT: '#0f6b63',
    50: '#f0fafa',
    100: '#ccefed',
    200: '#99dfdb',
    300: '#66cfc9',
    400: '#33bfb7',
    500: '#0f6b63',
    600: '#0d5e58',
    700: '#0b4f4a',
    800: '#09403c',
    900: '#07312e',
  },
  muted: '#5b6573',
  success: {
    DEFAULT: '#16a34a',
    light: '#dcfce7',
  },
  error: {
    DEFAULT: '#dc2626',
    light: '#fee2e2',
  },
  warning: {
    DEFAULT: '#d97706',
    light: '#fef3c7',
  },
} as const

export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  RECEIVED: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  TRIAGED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  EVIDENCE_READY: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  P2P_SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  APPEAL_DRAFTED: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  AWAITING_SIGNOFF: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  SUBMITTED: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  RESOLVED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    display: 'Fraunces, serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const

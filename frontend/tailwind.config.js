/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}

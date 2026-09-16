/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#0f1f3d',
          800: '#122a52',
          700: '#163766',
          600: '#1d4a85',
          500: '#255ea3',
        },
        accent: {
          600: '#0b5fa5',
          500: '#1573c2',
          400: '#2f8fd8',
        },
        risk: {
          low: '#2f8fd8',
          medium: '#f5a623',
          high: '#e0662f',
          critical: '#c0392b',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Consolas"', '"SFMono-Regular"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 31, 61, 0.08), 0 1px 6px rgba(15, 31, 61, 0.04)',
      },
    },
  },
  plugins: [],
};

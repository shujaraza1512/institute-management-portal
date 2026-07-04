/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Institutional navy — the portal's primary color, not Tailwind's default blue.
        navy: {
          50: '#eef2f8',
          100: '#d7e1ee',
          200: '#b0c3dd',
          300: '#89a5cc',
          400: '#5c80b3',
          500: '#3d6299',
          600: '#2c4c7c',
          700: '#1f3a63',
          800: '#162a49',
          900: '#0e1c31',
        },
        sky: {
          500: '#3b82c4', // secondary accent, used sparingly (links, active states)
        },
        surface: '#f7f9fc', // page background — off-white, not stark #fff
        ink: '#1e293b', // primary text
        muted: '#64748b', // secondary text
        approve: '#2f855a', // approved / success states
        pending: '#b7791f', // pending approval states
        reject: '#c53030', // rejected / error states
      },
      fontFamily: {
        display: ['"Lora"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 28, 49, 0.08), 0 1px 2px rgba(15, 28, 49, 0.06)',
      },
    },
  },
  plugins: [],
};

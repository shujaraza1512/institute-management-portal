/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Phase 8: rebuilt around the mandated 3-color brand palette.
        // navy-700 is the exact brand blue (#225775); the rest of the
        // scale is tints/shades of it for hover/active/background states.
        navy: {
          50: '#EEF4F7',
          100: '#D3E3EA',
          200: '#A7C7D5',
          300: '#7AABC0',
          400: '#4E8FAB',
          500: '#327597',
          600: '#275F7D',
          700: '#225775', // brand blue, exact
          800: '#1A4359',
          900: '#12303F',
        },
        // Accent -- a lighter tint of the same blue family (links, secondary
        // emphasis), not a separate hue.
        sky: {
          500: '#3D7A9E',
        },
        // Brand green (#95C83E, exact) plus a couple of supporting shades
        // for hover states and light badge/alert backgrounds.
        green: {
          50: '#F1F8E4',
          100: '#EAF5D9',
          500: '#95C83E', // brand green, exact
          600: '#7FAE32',
          700: '#6B9329',
        },
        surface: '#F5F8FA', // page background -- barely-off-white, blue-tinted
        ink: '#1A2E38', // primary text -- dark blue-gray, not flat black
        muted: '#5B7480', // secondary text -- medium blue-gray
        // Status semantics, built entirely from the blue/green scale above
        // (no red/amber) -- approved is brand green; pending is a lighter
        // blue tint; rejected is the darkest blue shade, paired with an
        // icon (not color alone) to stay distinguishable and accessible.
        approve: '#95C83E',
        pending: '#4E8FAB',
        reject: '#12303F',
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
        card: '0 1px 3px rgba(18, 48, 63, 0.08), 0 1px 2px rgba(18, 48, 63, 0.06)',
      },
    },
  },
  plugins: [],
};

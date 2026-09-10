/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        defense: {
          950: '#04070e',
          900: '#070c17',
          850: '#0a1120',
          800: '#0e172a',
          750: '#132039',
          700: '#1a2b4c',
          cyan: '#00f0ff',
          crimson: '#ff003c',
          amber: '#ffb703',
          emerald: '#00f59b',
        }
      },
      boxShadow: {
        'tactical': '0 0 15px rgba(0, 240, 255, 0.15)',
        'tactical-lg': '0 0 25px rgba(0, 240, 255, 0.25)',
        'threat': '0 0 15px rgba(255, 0, 60, 0.25)',
        'threat-lg': '0 0 25px rgba(255, 0, 60, 0.35)',
        'amber-glow': '0 0 15px rgba(255, 183, 3, 0.2)',
        'emerald-glow': '0 0 15px rgba(0, 245, 155, 0.2)',
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}

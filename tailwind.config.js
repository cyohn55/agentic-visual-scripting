/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        'canvas-bg': '#1a1a1a',
        'canvas-grid': '#2a2a2a',
        'node-bg': '#2d2d2d',
        'node-border': '#404040',
        'accent-blue': '#0ea5e9',
        'accent-purple': '#8b5cf6',
        'accent-green': '#10b981',
      }
    },
  },
  plugins: [],
} 
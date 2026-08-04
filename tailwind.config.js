/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'bg-dark': '#060d21',
        'dark': {
          'bg': '#060d21',
          'card': 'rgba(15, 23, 42, 0.65)',
          'border': 'rgba(255, 255, 255, 0.08)',
        },
        'glass': {
          'bg': 'rgba(15, 23, 42, 0.65)',
          'hover': 'rgba(30, 41, 59, 0.75)',
          'border': 'rgba(255, 255, 255, 0.10)',
        },
        'cefr': {
          'a1': '#10b981',
          'a2': '#0ea5e9',
          'b1': '#f59e0b',
          'b2': '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.3)',
        'glow-indigo': '0 0 25px -3px rgba(129, 140, 248, 0.3)',
        'glow-purple': '0 0 25px -3px rgba(192, 132, 252, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        '2xl': '40px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

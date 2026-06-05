/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050B14",
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          glow: "rgba(37, 99, 235, 0.5)",
        },
        secondary: "#64748b",
        accent: {
          DEFAULT: "#8b5cf6",
          glow: "rgba(139, 92, 246, 0.4)",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        card: "rgba(15, 23, 42, 0.6)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-hover': '0 12px 40px -10px rgba(37, 99, 235, 0.4)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.5)',
      },
      animation: {
        'float': 'float 20s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.05)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}

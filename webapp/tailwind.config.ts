import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Estos leen de variables CSS (definidas en globals.css) para poder
        // cambiarse en vivo desde /admin/configuracion sin recompilar.
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        'cream-alt': 'rgb(var(--color-cream-alt) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        whatsapp: '#25D366',
        urgent: '#E2472D',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'ui-serif', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(28, 18, 8, 0.08)',
        lift: '0 12px 32px rgba(169, 103, 58, 0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(var(--color-primary) / 0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgb(var(--color-primary) / 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        glow: 'glow 2.4s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        popIn: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
};

export default config;

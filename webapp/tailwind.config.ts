import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF3E5',
        'cream-alt': '#F5E6CE',
        ink: '#1C1208',
        muted: '#8A7660',
        border: '#E6D5BC',
        primary: {
          DEFAULT: '#A9673A',
          hover: '#8C5429',
          light: '#C9A06C',
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
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

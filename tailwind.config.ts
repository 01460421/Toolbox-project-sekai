import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ═══ 主題色 — 夜幕金箔 Night Velvet & Gold Leaf ═══
        sekai: {
          void: '#08080c',
          ink: '#0e0e14',
          velvet: '#14121c',
          charcoal: '#1c1a26',
          ash: '#2a2832',
          mist: '#4a4855',
          silver: '#8a8899',
          pearl: '#c4c4d0',
          ivory: '#e8e8f0',
          snow: '#f5f5fa',
        },
        // ═══ 金色系 — 璀璨層次 ═══
        gold: {
          deep: '#8B7355',
          muted: '#A89068',
          dim: '#B4956A',
          soft: '#C6A976',
          warm: '#D4B888',
          light: '#E2C89A',
          pale: '#E8D4A8',
          cream: '#F0E0B8',
          glow: '#F5EBD2',
          champagne: '#FDF8E8',
        },
        // ═══ 團體色彩 ═══
        unit: {
          ln: '#4455DD',
          'ln-light': '#6677EE',
          mmj: '#88DD44',
          'mmj-light': '#99EE55',
          vbs: '#EE6677',
          'vbs-light': '#FF8899',
          wxs: '#FFAA00',
          'wxs-light': '#FFBB33',
          niigo: '#9944BB',
          'niigo-light': '#AA66CC',
          vs: '#00BBBB',
          'vs-light': '#22DDDD',
        },
        ornament: {
          bronze: '#B87333',
          copper: '#B5651D',
          rose: '#B76E79',
          wine: '#722F37',
          royal: '#4169E1',
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', '"EB Garamond"', '"Noto Serif TC"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', '"Times New Roman"', '"Noto Serif TC"', 'serif'],
        body: ['"Times New Roman"', '"EB Garamond"', '"Cormorant Garamond"', '"Noto Serif TC"', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'velvet-gradient': 'linear-gradient(160deg, rgba(38, 35, 55, 0.95), rgba(20, 18, 28, 1), rgba(28, 25, 40, 0.95))',
        'gold-shimmer': 'linear-gradient(90deg, rgba(198, 169, 118, 0), rgba(245, 235, 210, 0.3), rgba(198, 169, 118, 0))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'elegant-reveal': 'elegantReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        'border-flow': 'borderFlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        elegantReveal: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.98)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)'
          },
        },
        borderFlow: {
          '0%, 100%': { borderColor: 'rgba(198, 169, 118, 0.2)' },
          '50%': { borderColor: 'rgba(198, 169, 118, 0.4)' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 30px rgba(198, 169, 118, 0.2), 0 0 60px rgba(198, 169, 118, 0.1)',
        'glow-gold-soft': '0 0 20px rgba(198, 169, 118, 0.15)',
        'glow-gold-intense': '0 0 50px rgba(198, 169, 118, 0.3), 0 0 100px rgba(198, 169, 118, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.02) inset',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(198, 169, 118, 0.08)',
        'card-luxury': '0 10px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(198, 169, 118, 0.3) inset',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'inner-gold': 'inset 0 1px 0 rgba(198, 169, 118, 0.1)',
        'btn-primary': '0 4px 20px rgba(198, 169, 118, 0.25), 0 1px 0 rgba(255, 255, 255, 0.2) inset',
        'btn-primary-hover': '0 6px 30px rgba(198, 169, 118, 0.35), 0 0 20px rgba(198, 169, 118, 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      letterSpacing: {
        'elegant': '0.06em',
        'luxury': '0.1em',
        'ornate': '0.15em',
      },
    },
  },
  plugins: [],
}

export default config

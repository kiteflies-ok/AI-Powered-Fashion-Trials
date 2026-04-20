/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0a0a0f',
                    800: '#0f0f18',
                    700: '#141420',
                },
                rose: {
                    50:  '#fff1f2',
                    100: '#ffe4e6',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                    700: '#be123c',
                },
                violet: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                },
            },
            fontFamily: {
                sans:    ['Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            animation: {
                'fade-in':    'fadeIn 0.5s ease-in-out',
                'slide-up':   'slideUp 0.7s cubic-bezier(0.22,1,0.36,1)',
                'float':      'float 6s ease-in-out infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'shimmer':    'shimmer 1.6s infinite',
                'spin-slow':  'spin 3s linear infinite',
                'gradient':   'gradientShift 5s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'scale(0.98)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%':   { opacity: '0', transform: 'translateY(32px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%,100%': { transform: 'translateY(0px)' },
                    '50%':     { transform: 'translateY(-10px)' },
                },
                glowPulse: {
                    '0%,100%': { boxShadow: '0 0 20px rgba(244,63,94,0.3)' },
                    '50%':     { boxShadow: '0 0 60px rgba(244,63,94,0.7), 0 0 100px rgba(244,63,94,0.3)' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition:  '200% 0' },
                },
                gradientShift: {
                    '0%,100%': { backgroundPosition: '0% 50%' },
                    '50%':     { backgroundPosition: '100% 50%' },
                },
            },
            boxShadow: {
                'glow-rose':   '0 0 40px rgba(244,63,94,0.4)',
                'glow-violet': '0 0 40px rgba(139,92,246,0.4)',
                'glass':       '0 8px 32px rgba(0,0,0,0.4)',
                'fashion':     '0 20px 60px rgba(0,0,0,0.5)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}

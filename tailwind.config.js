/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['Nunito', 'ui-rounded', 'sans-serif'],
      },
      boxShadow: {
        'soft-3d': '0 18px 40px rgba(14, 116, 144, 0.18)',
        'push-green': '0 5px 0 #047857, 0 10px 18px rgba(5, 150, 105, 0.22)',
        'push-cyan': '0 5px 0 #0e7490, 0 10px 18px rgba(14, 165, 233, 0.22)',
        'push-amber': '0 5px 0 #b45309, 0 10px 18px rgba(234, 179, 8, 0.22)',
        'push-rose': '0 5px 0 #be123c, 0 10px 18px rgba(244, 63, 94, 0.22)',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.94) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'pop-in': 'pop-in .35s cubic-bezier(.2, .85, .3, 1.2)',
      },
    },
  },
  plugins: [],
};

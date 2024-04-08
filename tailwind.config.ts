import type { Config } from 'tailwindcss';
const { nextui } = require('@nextui-org/react');

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
      '4xl': '2100px',
      '5xl': '2310px',
      '6xl': '2560px',
      '7xl': '2880px',
    },
    extend: {
      keyframes: {
        scrollUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        float: {
          '0%': {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateY(-1rem) scale(1.05)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        semakin: ['semakin'],
        decima: ['decima'],
        poppins: ['poppins'],
        'poppins-medium': ['poppins-medium'],
      },
      colors: {
        notion: '#ff4848',
        'basic-blue': '#4C95C7',
        'basic-yellow': '#f6c799',
        'basic-gray': '#1D1D1D',
        'light-gray': '#999999',
        'deep-yellow': '#96775A',
      },
      animation: {
        spin5: 'spin 5s linear infinite',
        float3: 'float 3s ease-in-out infinite',
        float5: 'float 5s ease-in-out infinite',
      },
      fontSize: {
        'fz-12': '12px',
        'fz-14': '14px',
        'fz-16': '16px',
        'fz-18': '18px',
        'fz-20': '20px',
      },
      borderColor: {
        'deep-yellow': '#665C50',
      },
      borderWidth: {
        1: '1px',
      },
      borderRadius: {
        base: '0.625rem',
      },
      spacing: {
        ten: '0.625rem',
        '1px': '1px',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
};
export default config;

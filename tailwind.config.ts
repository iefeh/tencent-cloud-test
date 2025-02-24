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
      mb: '750px',
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
        breathShadow: {
          '50%': {
            'box-shadow': '0 0 1rem 0.5rem #f6c799',
            transform: 'scale(1.03)',
          },
        },
        shaking: {
          '0%': {
            transform: 'rotate(-6deg)',
          },
          '50%': {
            transform: 'rotate(6deg)',
          },
          '100%': {
            transform: 'rotate(-6deg)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        jcyt4: ['jcyt4'],
        jcyt6: ['jcyt6'],
        semakin: ['semakin'],
        decima: ['decima'],
        poppins: ['poppins'],
        'poppins-medium': ['poppins-medium'],
        fzdb: ['fzdb'],
        fzsb: ['fzsb'],
        'shs-bold': ['shs-bold'],
        'shs-ex-light': ['shs-ex-light'],
        'shs-heavy': ['shs-heavy'],
        'shs-light': ['shs-light'],
        'shs-medium': ['shs-medium'],
        shs: ['shs'],
        'shs-regular': ['shs-regular'],
      },
      colors: {
        brown: '#5C0F0F',
        'yellow-1': '#FDC511',
        'light-yellow': '#E7D4A9',
        'light-yellow-1': '#F7E9CC',
        notion: '#ff4848',
        'pure-red': '#BD0000',
        'basic-red': '#FF0000',
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
        breathShadow: 'breathShadow 3s ease-in-out infinite',
        shaking: 'shaking 4s ease-in-out infinite',
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
        five: '0.3125rem',
      },
      spacing: {
        five: '0.3125rem',
        ten: '0.625rem',
        '1px': '1px',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
};
export default config;

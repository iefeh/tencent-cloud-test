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
    extend: {
      keyframes: {
        scrollUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
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
        'basic-yellow': '#f6c799',
        'basic-gray': '#1D1D1D',
        'deep-yellow': '#96775A',
      },
      animation: {
        spin5: 'spin 5s linear infinite',
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
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;

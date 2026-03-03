import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        holi: {
          pink: '#FF3CAC',
          orange: '#FFB86B',
          cyan: '#33E8FF',
          violet: '#7A5CFF'
        }
      }
    }
  },
  plugins: []
};

export default config;

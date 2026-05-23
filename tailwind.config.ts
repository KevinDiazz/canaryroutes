import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        brand: {
          green: '#1f9d61',
          'green-light': '#bff4d2',
          'green-mid': '#47c987',
        },
      },
    },
  },
  plugins: [],
};

export default config;

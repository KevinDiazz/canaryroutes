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
          green:       '#1f9d61',  // acento principal
          'green-light': '#bff4d2',
          'green-mid': '#47c987',
          forest:      '#1a3d2b',  // nav background
        },
        surface: {
          sand:   '#f0ede6',  // fondo mapa + overlay (arena volcánica)
          ocean:  '#9ed5ee',  // agua SVG (atlántico)
          pill:   'rgba(240,237,230,0.97)',
        },
      },
    },
  },
  plugins: [],
};

export default config;

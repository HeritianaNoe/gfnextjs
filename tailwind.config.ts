import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bark: {
          950: "#160F0A",
          900: "#1E140D",
          800: "#2B1D12",
          700: "#3B2818",
        },
        wood: {
          600: "#7A4E28",
          500: "#8F5C30",
          400: "#A8703F",
          300: "#C08B57",
        },
        laterite: {
          600: "#9C3F2E",
          500: "#B24E3A",
        },
        raffia: {
          500: "#D3A24C",
          400: "#E0B565",
        },
        bone: "#F1E7D6",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-karla)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0d6e6e",
          gold: "#c9a227",
          ink: "#1a1a1a",
        },
        site: {
          acropolis: { DEFAULT: "#0d6e6e", dark: "#0a5555" },
          civis: { DEFAULT: "#3B4BA0", dark: "#2F3D85" },
          biblioteca: { DEFAULT: "#fdcb20", dark: "#e6b800", ink: "#1a1a1a" },
          editorial: { DEFAULT: "#ee934c", dark: "#d97a32" },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-site-acropolis",
    "hover:bg-site-acropolis-dark",
    "border-site-acropolis",
    "bg-site-civis",
    "hover:bg-site-civis-dark",
    "border-site-civis",
    "bg-site-biblioteca",
    "hover:bg-site-biblioteca-dark",
    "border-site-biblioteca",
    "text-site-biblioteca-ink",
    "bg-site-biblioteca/5",
    "ring-site-biblioteca-dark/30",
    "ring-site-biblioteca-dark/25",
    "bg-site-editorial",
    "hover:bg-site-editorial-dark",
    "border-site-editorial",
  ],
};
export default config;

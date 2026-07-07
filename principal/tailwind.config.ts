import type { Config } from "tailwindcss";

/**
 * Paleta oficial OINA 2025 (Guía de uso de marca Nueva Acrópolis v01).
 * Heket dominante · Kefer puente · Amón/Helios acentos · Delfos neutro.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        na: {
          // Paleta primaria oficial (Guía de marca v01)
          heket: "#086357", // Verde Heket (dominante)
          kefer: "#009485", // Turquesa Kefer (puente)
          amon: "#f39300", // Naranja Amón (acento)
          helios: "#ffca00", // Amarillo Helios (acento)
          delfos: "#d8d9db", // Gris Delfos (neutro)
          // Verdes de la paleta secundaria (C9 / C10)
          keferLight: "#009c5e", // C10
          verdeC9: "#017948", // C9
          // El verde más oscuro de marca es Heket: no inventamos tonos más oscuros.
          heketDark: "#086357",
          // roles
          primary: "#086357",
          primaryDark: "#086357",
          accent: "#009485",
          gold: "#f39300",
          ink: "#1d1d1b", // negro de marca (variantes de negro)
          muted: "#4a5754",
          sand: "#eef0f2",
          cream: "#f7f8f8",
          surface: "#ffffff",
          footer: "#086357", // footer en Heket (sin tonos inventados)
          // Submarcas (Guía OINA §5.3)
          sophia: "#5BA6DC",
          sophiaDark: "#4A86B0",
          editorial: "#EA7604",
          editorialDark: "#CD4B0C",
          civis: "#3B4BA0",
          civisDark: "#2F3D85",
          circulo: "#5BB5E8",
          circuloDark: "#3A9AD4",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "na-soft": "0 20px 60px rgba(8, 99, 87, 0.12)",
        "na-card": "0 18px 48px rgba(8, 99, 87, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;

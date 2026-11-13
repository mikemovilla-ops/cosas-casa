import type { Config } from "tailwindcss";

// Los colores que dependen del tema elegido (fondo, superficies, bordes y
// acento) son variables CSS — ver app/globals.css y los temas de
// MenuAjustes. El resto son fijos para todos los temas.
const variable = (nombre: string) => `rgb(var(--color-${nombre}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fondo: variable("fondo"),
        fondooscuro: variable("fondooscuro"),
        superficie: variable("superficie"),
        borde: variable("borde"),
        acento: variable("acento"),
        acentovivo: variable("acentovivo"),
        tinta: "#EDF1EC",
        coral: "#FF7A6B",
        ambar: "#F2B84B",
        exito: "#4ADE95",
        personaA: "#5B9BD5",
        personaB: "#D9708A",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;

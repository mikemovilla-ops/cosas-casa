import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        ink: "#2B2620",
        sand: "#E8DCC8",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        sagedark: "rgb(var(--color-sagedark) / <alpha-value>)",
        clay: "#C1694F",
        mustard: "#D6A24C",
        personaA: "#4A7FA7",
        personaB: "#B5566B",
      },
    },
  },
  plugins: [],
};

export default config;

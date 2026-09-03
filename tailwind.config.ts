import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enkays: {
          50: "#f0fbf6",
          100: "#d9f3e6",
          200: "#b3e7cd",
          400: "#3fbf85",
          500: "#159a63",
          600: "#0f7a4f",
          700: "#0c5f3f",
          900: "#0a3d2a",
        },
        ink: {
          900: "#0b1210",
          700: "#2b332f",
          500: "#5d6863",
          300: "#a7afab",
          100: "#eef1ef",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

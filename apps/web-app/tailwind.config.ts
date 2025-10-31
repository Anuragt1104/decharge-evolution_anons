import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#04070d",
        foreground: "#f1f5f9",
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(16, 185, 129, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
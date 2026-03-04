import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        brand: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
        },
        hero: {
          bg: "#F8F7F3",
          accent: "#F59E0B",
          "text-primary": "#0F172A",
          "text-secondary": "#64748B",
          border: "#E2E8F0",
          badge: {
            amber: { bg: "#FEF3C7", text: "#92400E" },
            blue: { bg: "#DBEAFE", text: "#1E40AF" },
            tag: { bg: "#EFF6FF", text: "#2563EB" },
          },
        },
        surface: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          dark: "#0f172a",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        card: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
        "card-hover": "0 10px 40px -10px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

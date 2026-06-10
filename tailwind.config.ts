import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-thai)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          900: "hsl(var(--brand-900))"
        },
        accent: {
          100: "hsl(var(--accent-100))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(44, 54, 114, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

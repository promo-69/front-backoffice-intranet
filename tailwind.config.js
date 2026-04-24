/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // TUS COLORES SEMÁNTICOS (Para uso directo: text-brand-primary)
        brand: {
          primary: "hsl(var(--primary))", 
          gold: "hsl(var(--accent))",
        },

        // INTEGRACIÓN FUNCIONAL PARA COMPONENTES SHADCN
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },

      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        'cineflix': 'var(--radius)',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      }
    },
  },
  plugins: [animate],
}
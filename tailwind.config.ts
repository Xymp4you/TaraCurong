import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter Tight", "Satoshi", ...defaultTheme.fontFamily.sans],
        display: ["Inter Tight", "Satoshi", ...defaultTheme.fontFamily.sans],
        serif: ["Source Serif 4", ...defaultTheme.fontFamily.serif],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ===== TaraCurong redesign palette — Quiet Official =====
        ink: {
          50:  "#F5F5F2",
          100: "#EDEDE7",
          200: "#E8E8E2",
          300: "#DADCDF",
          400: "#B5B8BD",
          500: "#8A8F98",
          600: "#5C6470",
          700: "#3F4651",
          800: "#2A3038",
          900: "#0B0F14",
        },
        teal: {
          50:  "#EAF3F2",
          100: "#CDE5E3",
          500: "#1A9591",
          600: "#0E7C7B",
          700: "#0B5F5E",
        },
        parchment: {
          DEFAULT: "#F7F2E6",
          200:     "#EFE7D2",
        },
        seal: {
          gold:  "#8E6F1F",
          gold2: "#C8A14A",
        },
        role: {
          jobseeker: "#0B5F5E",
          employer:  "#4A33A8",
          admin:     "#862435",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "1rem",
        section: "1.5rem",
        hero: "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

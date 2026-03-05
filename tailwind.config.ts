import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      colors: {
        brand: {
          50: "#f0f0ff",
          100: "#e2e2ff",
          200: "#c7c7ff",
          300: "#a8a8ff",
          400: "#8b8bff",
          500: "#6c6cff",
          600: "#5555e8",
          700: "#4040cc",
          800: "#2e2ea8",
          900: "#1e1e80",
        },
        canvas: {
          950: "#080810",
          900: "#0d0d1a",
          800: "#111124",
          700: "#16162e",
        },
        chart: {
          1: "#6c6cff",
          2: "#a78bfa",
          3: "#34d399",
          4: "#f59e0b",
          5: "#ef4444",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-hover": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)",
        "glass-active": "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        "glow-brand": "0 0 24px rgba(108,108,255,0.35)",
        "glow-green": "0 0 24px rgba(34,197,94,0.30)",
        "glow-red": "0 0 24px rgba(239,68,68,0.30)",
        "glow-amber": "0 0 24px rgba(245,158,11,0.30)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6c6cff 0%, #a78bfa 100%)",
        "danger-gradient": "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
        "success-gradient": "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
        "amber-gradient": "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
        "mesh-bg":
          "radial-gradient(at 20% 20%, rgba(108,108,255,0.15) 0, transparent 50%), radial-gradient(at 80% 10%, rgba(167,139,250,0.10) 0, transparent 40%), radial-gradient(at 50% 90%, rgba(34,211,238,0.08) 0, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;

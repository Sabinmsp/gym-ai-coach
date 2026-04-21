import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#A3FF12",
          glow: "#C6FF4A",
          soft: "#E6FFB0",
        },
        ink: {
          950: "#06070A",
          900: "#0B0D12",
          800: "#12151C",
          700: "#1A1E27",
          600: "#232836",
          500: "#2E3446",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 24px rgba(163, 255, 18, 0.35), 0 0 60px rgba(163, 255, 18, 0.15)",
        "glow-lg":
          "0 0 40px rgba(163, 255, 18, 0.45), 0 0 120px rgba(163, 255, 18, 0.18)",
        "card-inset":
          "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 1px 2px 0 rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(163,255,18,0.08), transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-out both",
        "slide-up": "slideUp 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow:
              "0 0 22px rgba(163,255,18,0.35), 0 0 60px rgba(163,255,18,0.12)",
          },
          "50%": {
            boxShadow:
              "0 0 32px rgba(163,255,18,0.55), 0 0 100px rgba(163,255,18,0.22)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

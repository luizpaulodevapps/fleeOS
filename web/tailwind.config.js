/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Material You tokens (original) ── */
        error: "#ba1a1a",
        "on-tertiary-fixed": "#271901",
        "tertiary-fixed": "#fcdeb5",
        "on-secondary-fixed-variant": "#3c475a",
        "surface-container-high": "#eae7e9",
        "tertiary-fixed-dim": "#dec29a",
        "on-secondary-container": "#586377",
        outline: "#76777d",
        "on-surface": "#1b1b1d",
        "on-primary": "#ffffff",
        "on-tertiary-container": "#98805d",
        "primary-fixed-dim": "#bec6e0",
        "on-primary-fixed": "#131b2e",
        background: "#fcf8fa",
        "secondary-fixed-dim": "#bcc7de",
        "inverse-on-surface": "#f3f0f2",
        "on-tertiary": "#ffffff",
        "outline-variant": "#c6c6cd",
        "on-background": "#1b1b1d",
        "secondary-container": "#d5e0f8",
        "on-secondary-fixed": "#111c2d",
        "on-primary-container": "#7c839b",
        tertiary: "#000000",
        "on-error": "#ffffff",
        "surface-container": "#f0edef",
        "on-surface-variant": "#45464d",
        "surface-dim": "#dcd9db",
        surface: "#fcf8fa",
        "error-container": "#ffdad6",
        "primary-container": "#131b2e",
        "surface-tint": "#565e74",
        "surface-container-highest": "#e4e2e4",
        "on-error-container": "#93000a",
        secondary: "#545f73",
        "on-secondary": "#ffffff",
        "on-primary-fixed-variant": "#3f465c",
        primary: "#000000",
        "tertiary-container": "#271901",
        "primary-fixed": "#dae2fd",
        "inverse-surface": "#303032",
        "on-tertiary-fixed-variant": "#574425",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed": "#d8e3fb",
        "surface-container-low": "#f6f3f5",
        "inverse-primary": "#bec6e0",
        "surface-bright": "#fcf8fa",
        "surface-variant": "#e4e2e4",
        "accent-green": "#10b981",

        /* ── Obsidian dark palette ── */
        obsidian: {
          50:  "#f0f4ff",
          100: "#dce6ff",
          200: "#b9ceff",
          300: "#8aaeff",
          400: "#5a88f8",
          500: "#3b67f0",
          600: "#2b4de4",
          700: "#2339cc",
          800: "#1e2fa5",
          900: "#1a2680",
          950: "#0d1117",
        },

        /* ── Brand / accent (emerald-green) ── */
        brand: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      spacing: {
        "container-max": "1440px",
        "stack-xl": "48px",
        "stack-md": "16px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        gutter: "24px",
        unit: "4px",
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-lg": "24px",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        geist: ["Geist", "sans-serif"],
      },

      boxShadow: {
        glass:        "0 8px 32px rgba(0,0,0,0.45)",
        "glass-hover":"0 16px 56px rgba(16,185,129,0.25)",
        "glow-brand": "0 0 40px rgba(16,185,129,0.35)",
        "glow-sm":    "0 0 16px rgba(16,185,129,0.2)",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },

      animation: {
        "float":       "float 6s ease-in-out infinite",
        "pulse-slow":  "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":     "shimmer 2.5s linear infinite",
        "slide-up":    "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":     "fadeIn 0.4s ease forwards",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

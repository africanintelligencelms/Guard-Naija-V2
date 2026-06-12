/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#008751", // Nigeria green
          dark: "#006B40",
          light: "#E6F4EE",
        },
        surface: "#FFFFFF",
        background: "#F7F8FA",
        ink: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
          faint: "#9CA3AF",
        },
        danger: "#DC2626",
        warning: "#F59E0B",
        info: "#2563EB",
        // Legacy aliases used by pre-redesign components (Phase 3/4 removes them)
        "guard-green": "#008751",
        "guard-dark": "#0F172A",
        "alert-red": "#DC2626",
      },
      animation: {
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.8, 0, 1, 1)",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

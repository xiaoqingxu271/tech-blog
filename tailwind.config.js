/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 「极光」主题：深紫蓝夜空底色 + 青色霓虹点缀
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490"
        },
        night: {
          50: "#f1f5ff",
          100: "#e0e7ff",
          700: "#312e81",
          800: "#1e1b4b",
          900: "#16123a",
          950: "#0b0920"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,211,238,0.25)",
        "glow-lg": "0 0 40px rgba(34,211,238,0.35)",
        card: "0 8px 32px rgba(2,6,23,0.35)"
      }
    }
  },
  plugins: []
};

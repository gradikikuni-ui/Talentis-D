export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
        },
        mist: {
          100: "rgb(var(--mist-100) / <alpha-value>)",
          200: "rgb(var(--mist-200) / <alpha-value>)",
          300: "rgb(var(--mist-300) / <alpha-value>)",
          400: "rgb(var(--mist-400) / <alpha-value>)",
          500: "rgb(var(--mist-500) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
        cyan: { 300: "#7CE8FF", 400: "#3DDBFF" },
        signal: { mint: "#34D399", coral: "#FB7185" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "signal-gradient": "linear-gradient(90deg, #3DDBFF 0%, #7CE8FF 100%)",
        "ink-gradient": "linear-gradient(135deg, rgb(var(--ink-900)) 0%, rgb(var(--ink-800)) 60%, rgb(var(--ink-700)) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(61, 219, 255, 0.25)",
        card: "0 8px 30px -14px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        drift: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        fadeUp: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        drift: "drift 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
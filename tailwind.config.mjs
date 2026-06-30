/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "northlace-900": "#04342C",
        "northlace-700": "#0F6E56",
        "northlace-400": "#5DCAA5",
        "northlace-100": "#9FE1CB",
        "northlace-50": "#E1F5EE",
        "surface-warm": "#F1EFE8",
        "status-amber": "#BA7517",
        "text-primary": "#1A1A18",
        "text-on-dark": "#F1EFE8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        display: [
          "56px",
          { lineHeight: "1.1", fontWeight: "500", letterSpacing: "-0.02em" },
        ],
        h1: [
          "40px",
          { lineHeight: "1.15", fontWeight: "500", letterSpacing: "-0.02em" },
        ],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "500" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.6", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

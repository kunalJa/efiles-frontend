import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "archive-yellow": "#F4E4BC",
        "file-folder-brown": "#8B7355",
        "mystery-purple": "#4A3B69",
        "ink-black": "#2C2C2C",
        "stamp-red": "#C94C4C",
        "parchment-white": "#FDF5E6",
        "metallic-gold": "#D4AF37",
        "slate-blue": "#5D737E",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        paper: "0 22px 60px rgba(74, 59, 105, 0.14)",
        gold: "0 0 0 3px rgba(212, 175, 55, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

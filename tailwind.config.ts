/**
 * Tailwind CSS Configuration — Pedabook Builder
 *
 * NOTE: This project uses Tailwind CSS v4. In v4, the canonical theme
 * configuration lives in app/globals.css inside the `@theme { }` block.
 * This file is kept for IDE intellisense, tooling compatibility, and
 * documentation purposes. Any changes to the design tokens should be
 * made in globals.css (@theme) first.
 *
 * See: https://tailwindcss.com/docs/v4-beta
 */

import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
    "./store/**/*.{ts,tsx,js,jsx}",
    "./types/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      /* ----------------------------------------------------------------
         Colors — mirrors CSS variables in globals.css :root
         ---------------------------------------------------------------- */
      colors: {
        primary: {
          DEFAULT: "#1B3A6B",
          light: "#2A5298",
          dark: "#122548",
        },
        secondary: {
          DEFAULT: "#C9A227",
          light: "#E0B93A",
          dark: "#A8841C",
        },
        accent: {
          DEFAULT: "#E84855",
          light: "#F06570",
          dark: "#C93540",
        },
        success: {
          DEFAULT: "#2D9B5A",
          light: "#38C06F",
          dark: "#1F7040",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#FFFFFF",
          overlay: "rgba(255,255,255,0.95)",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
          subtle: "#F1F5F9",
        },
        "bg-app": "#F4F6FB",
        "bg-alt": "#EEF1F8",
        "text-muted": "#718096",
        "text-subtle": "#A0AEC0",
        "text-inverse": "#FFFFFF",
        "text-link": "#1B3A6B",
      },

      /* ----------------------------------------------------------------
         Typography — Arabic fonts
         ---------------------------------------------------------------- */
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        amiri: ["Amiri", "serif"],
        naskh: ["Noto Naskh Arabic", "sans-serif"],
        heading: ["Cairo", "Amiri", "sans-serif"],
        body: ["Noto Naskh Arabic", "Cairo", "sans-serif"],
        ui: ["Cairo", "sans-serif"],
      },

      /* ----------------------------------------------------------------
         Box Shadows — editor panel hierarchy
         ---------------------------------------------------------------- */
      boxShadow: {
        panel: "0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.08)",
        toolbar: "0 2px 8px rgba(0,0,0,0.10)",
        artboard:
          "0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.10)",
        float: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        inset: "inset 0 1px 3px rgba(0,0,0,0.08)",
      },

      /* ----------------------------------------------------------------
         Screens — standard + editor breakpoint
         ---------------------------------------------------------------- */
      screens: {
        xs: "480px",
        editor: "1200px",
      },

      /* ----------------------------------------------------------------
         Spacing — artboard page dimensions (96 dpi)
         a4-w  = 210 mm = 793 px
         a4-h  = 297 mm = 1122 px
         a5-w  = 148 mm = 559 px
         a5-h  = 210 mm = 793 px
         b5-w  = 176 mm = 669 px
         b5-h  = 250 mm = 945 px
         ---------------------------------------------------------------- */
      spacing: {
        "a4-w": "793px",
        "a4-h": "1122px",
        "a5-w": "559px",
        "a5-h": "793px",
        "b5-w": "669px",
        "b5-h": "945px",
        "topbar": "52px",
        "sidebar-left": "260px",
        "sidebar-right": "280px",
        "toolbar": "44px",
      },

      /* ----------------------------------------------------------------
         Border Radius
         ---------------------------------------------------------------- */
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      /* ----------------------------------------------------------------
         Animations — shimmer, fadeIn, slideIn
         ---------------------------------------------------------------- */
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInStart: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInEnd: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn 0.2s ease forwards",
        "fade-in-up": "fadeInUp 0.25s ease forwards",
        "fade-in-down": "fadeInDown 0.25s ease forwards",
        "slide-in-start": "slideInStart 0.2s ease forwards",
        "slide-in-end": "slideInEnd 0.2s ease forwards",
        "scale-in": "scaleIn 0.15s ease forwards",
      },
    },
  },

  plugins: [
    /* ----------------------------------------------------------------
       RTL utilities plugin
       Adds directional variants: rtl: and ltr:
       e.g. <div class="rtl:text-right ltr:text-left">
       ---------------------------------------------------------------- */
    plugin(function ({ addVariant }) {
      addVariant("rtl", '[dir="rtl"] &');
      addVariant("ltr", '[dir="ltr"] &');
    }),

    /* ----------------------------------------------------------------
       Arabic typography utilities plugin
       ---------------------------------------------------------------- */
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".arabic-ligatures": {
          "font-feature-settings": '"kern" 1, "liga" 1, "calt" 1',
          "text-rendering": "optimizeLegibility",
        },
        ".no-ligatures": {
          "font-feature-settings": '"liga" 0',
        },
        ".text-justify-arabic": {
          "text-align": "justify",
          "text-justify": "inter-word",
        },
        ".writing-mode-vertical": {
          "writing-mode": "vertical-rl",
        },
      });
    }),
  ],
};

export default config;

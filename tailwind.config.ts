import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Nunito Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--color-bg)",
        foreground: "var(--foreground)",
        primary: "#A06AFF",
        secondary: "#808283",
        tyrian: "#A06AFF",
        "tyrian-dark": "#482090",
        "tyrian-light": "#A06AFF",
        "tyrian-soft": "#CDBAFF",
        card: "var(--card)",

        blackedGray: "var(--color-darkCharcoal)",
        purple: "var(--color-lavenderIndigo)",

        moonlessNight: "var(--color-moonlessNight)",
        onyxGrey: "var(--color-onyxGrey)",

        white: "var(--color-white)",
        webGray: "var(--color-webGray)",
        black: "var(--color-black)",

        green: "var(--color-mountainMeadow)",
        red: "var(--color-fieryRose)",

        orange: "var(--color-orangePeel)",
        darkOrange: "var(--color-darkOrange)",
        blue: "var(--color-cornflowerBlue)",
        darkGreen: "var(--color-darkJungleGreen)",
        darkRed: "var(--color-darkSienna)",
        gunpowder: "var(--color-gunpowder)",
        regaliaPurple: "var(--color-regaliaPurple)",
        lighterAluminum: "var(--color-lighterAluminum)",
        indigo: "var(--color-indigo)",
        darkPurple: "var(--color-darkPurple)",
        lightPurple: "var(--color-lightPurple)",
        richBlack: "var(--color-richBlack)",

        lightGray: "#1F2229",
        gray: "#272A32",
      },
      boxShadow: {
        "avatar-shadow": "0 6.71px 11.41px -1.34px rgba(0,0,0,0.28)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-xy": "gradient-xy 3s ease infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".custom-bg-blur": {
          "background-color": "var(--color-bg)",
          "backdrop-filter": "blur(100px)",
          "-webkit-backdrop-filter": "blur(100px)",
        },
      });
    }),
  ],
} satisfies Config;

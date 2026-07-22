import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        ink: "#23312D",
        rice: "#FBF8EF",
        cinnabar: "#B85042",
        museumGold: "#B9A46C",
        celadon: "#8CA99A",
        porcelain: "#E7F0EE",
        paper: "#FFFDF7",
        pine: "#36584E",
        mist: "#EEF5F1",
        soot: "#18211F"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem"
      },
      fontFamily: {
        serif: [
          '"STYuanti"',
          '"Yuanti SC"',
          '"YouYuan"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei UI"',
          '"PingFang SC"',
          "sans-serif"
        ],
        sans: [
          '"HarmonyOS Sans SC"',
          '"MiSans"',
          '"Alibaba PuHuiTi"',
          '"PingFang SC"',
          '"Microsoft YaHei UI"',
          '"Microsoft YaHei"',
          '"Noto Sans SC"',
          "sans-serif"
        ]
      },
      boxShadow: {
        museum: "0 24px 70px rgba(35, 49, 45, 0.13)",
        goldline: "0 0 0 1px rgba(140, 169, 154, 0.24)",
        porcelain: "0 22px 60px rgba(54, 88, 78, 0.16)"
      },
      backgroundImage: {
        "paper-noise":
          "linear-gradient(135deg, rgba(255,253,247,0.88), rgba(231,240,238,0.52)), repeating-linear-gradient(90deg, rgba(35,49,45,0.022) 0, rgba(35,49,45,0.022) 1px, transparent 1px, transparent 9px)",
        "ink-wash":
          "linear-gradient(180deg, rgba(35,49,45,0) 0%, rgba(35,49,45,0.54) 74%, #23312D 100%)"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" }
        }
      },
      animation: {
        shimmer: "shimmer 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;

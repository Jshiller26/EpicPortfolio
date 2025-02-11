import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        shine: {
          '0%': { 
            transform: 'translateX(-100%)',
          },
          '100%': { 
            transform: 'translateX(400%)',
          },
        },
      },
      animation: {
        'shine': 'shine 4s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
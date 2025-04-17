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
        'windows-desktop': '#008080',
        'windows-taskbar': '#c0c0c0', 
        'windows-window': '#ffffff',
        'windows-title-bar': '#000080', 
      },
      keyframes: {
        shine: {
          '0%': { 
            transform: 'translateX(-100%)',
          },
          '100%': { 
            transform: 'translateX(500%)',
          },
        },
        spinContainer: {
          '0%': { 
            transform: 'rotate(0deg)',
          },
          '100%': { 
            transform: 'rotate(360deg)',
          },
        },
      },
      animation: {
        'shine': 'shine 4s ease-out',
        'spin-container': 'spinContainer 1.5s infinite linear',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(80px, 1fr))',
      },
    },
  },
  plugins: [],
} satisfies Config;
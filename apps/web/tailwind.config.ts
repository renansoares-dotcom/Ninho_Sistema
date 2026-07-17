import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004AAD",
        "primary-dark": "#232932",
        background: "#fafafa",
      },
    },
  },
  plugins: [],
};

export default config;

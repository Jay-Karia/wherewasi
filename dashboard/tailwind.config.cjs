const plugin = require("tailwindcss/plugin");
const daisyui = require("daisyui");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      width: {
        150: "calc(var(--spacing) * 150)",
      },
      height: {
        75: "calc(var(--spacing) * 7)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#646cff",
          secondary: "#535bf2",
          accent: "#7c9cff",
          neutral: "#f9fafb",
          "base-100": "#ffffff",
          info: "#93c5fd",
        },
      },
      "dark",
    ],
  },
};

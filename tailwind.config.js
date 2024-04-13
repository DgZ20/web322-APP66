/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs'],
    daisyui: {
      themes: ["light", "dark", "valentine"],
  },
  plugins: [],
  purge: [],
  plugins: [
    require('@tailwindcss/typography'), require('daisyui'),
  ],
 
}


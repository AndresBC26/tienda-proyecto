/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define dónde buscar clases de Tailwind
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Todos los archivos en src/
  ],
  theme: {
    extend: {}, // Extensiones personalizadas del tema
  },
  plugins: [], // Plugins adicionales
}
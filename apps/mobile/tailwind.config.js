const { PALETA, FUENTES } = require('./constants/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    // Los estilos por estado (EstadosMascota, EstadosPublicacion...) son clases escritas en
    // constants/: si no se escanea, Tailwind no las genera y la pastilla sale sin color.
    './constants/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta clásica (login, formularios, listados). Los hex viven en constants/theme.js.
        pethood: {
          orange: PALETA.pethood.naranja,
          'orange-dark': PALETA.pethood.naranjaOscuro,
          // Mismo fondo que Inicio: una sola paleta de fondo en toda la app.
          beige: PALETA.bg,
          'beige-dark': PALETA.pethood.beigeOscuro,
          input: PALETA.pethood.input,
        },
        // Sistema Organic: paleta del rediseño (Inicio, barra inferior).
        organic: {
          bg: PALETA.bg,
          surface: PALETA.surface,
          accent: PALETA.accent,
          calido: PALETA.calido,
          neutral: PALETA.neutral,
        },
      },
      fontFamily: {
        titulo: [FUENTES.titulo],
        cuerpo: [FUENTES.cuerpo],
        'cuerpo-semi': [FUENTES.cuerpoSemi],
        'cuerpo-bold': [FUENTES.cuerpoBold],
      },
    },
  },
  plugins: [],
};

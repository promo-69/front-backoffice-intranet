/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
 theme: {
    extend: {
      colors: {
        /* PRIMITIVOS (Escalas de colores) */
        midnight: {
          50: '#F1EFF9', 100: '#E7E3F4', 200: '#CDC4E9', 300: '#B6A9DF',
          400: '#A08ED4', 500: '#8870C8', 600: '#434344', 700: '#5D419D',
          800: '#442E74', 900: '#2E1E51', 950: '#231640',
        },
        gold: {
          50: '#fef1e7', 100: '#fde4ce', 200: '#fcc891', 300: '#f6ad38',
          400: '#d9982f', 500: '#b27c25', 600: '#8e621b', 700: '#6c4912',
          800: '#4b320a', 900: '#2a1a03', 950: '#1d1102',
        },
        indigo: {
          300: '#B9AEF0', // Usado para acentos visuales suaves
        },
        lila: {
          50: '#F5F3FF',  // Tono extra suave para fondos de selección
          200: '#CDC4E9', // Usado para estados secundarios
        },

        /*SEMÁNTICOS (Específicos para el Backoffice sobre fondo claro) */
        brand: {
          primary: '#3E2186', // Morado principal: Usar en títulos y botones
          accent: '#d9982f',  // Dorado: Usar en acciones VIP o resaltados
        },

        // Colores de superficie 
        surface: {
          main: '#F9F9F8',    // El fondo claro que definiste para la web
          container: '#FFFFFF', // Fondo blanco para las tarjetas/tablas sobre el main
          low: '#F1EFF9',     // Alternancia de filas (Zebra striping)
          
          /* INTERACCIÓN */
          hover: '#E7E3F4',   // Color cuando el mouse pasa sobre una fila 
          active: '#CDC4E9',  // Color cuando un elemento está seleccionado 
        },

        status: {
          success: '#109788',
          error: '#ef4444',
          warning: '#f6ad38',
          info: '#B9AEF0',    
        }
      },

      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        'cineflix': '8px',
      }
    },
  },
  plugins: [],
}


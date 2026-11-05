// vite.config.js

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // el servidor solo acepta (CORS) peticiones que vengan de http://localhost:5173
    strictPort: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Permite escribir @import 'bootstrap/scss/bootstrap' en main.scss
        loadPaths: ['node_modules'],
        // Bootstrap 5.3 todavía usa @import y funciones de color antiguas, se pone quietdeps para que no muestre los deprecated warnings
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions']
      }
    }
  }
});

// vite.config.js

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // el servidor solo acepta (CORS) peticiones que vengan de http://localhost:5173
        strictPort: true
    }
});

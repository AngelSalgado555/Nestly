import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; // 1. IMPORTANTE: Importar el plugin

export default defineConfig({
    plugins: [
        laravel({
            // 2. Cambiamos app.js por app.jsx si vas a usar React
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(), // 3. IMPORTANTE: Activar el plugin
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
    },
});
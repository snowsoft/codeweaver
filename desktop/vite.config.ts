import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // UTF-8 header ekle
        headers: {
            'Content-Type': 'text/html; charset=UTF-8'
        }
    },
    build: {
        charset: 'utf8'
    }
});
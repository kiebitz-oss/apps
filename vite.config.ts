import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh()],
    base: '/user/',
    resolve: {
        alias: {
            helpers: path.resolve(__dirname, 'src/helpers'),
            '@/components': path.resolve(__dirname, 'src-vite/components'),
            '@/features': path.resolve(__dirname, 'src-vite/features'),
            '@/utils': path.resolve(__dirname, 'src-vite/utils'),
            '@/kiebitz': path.resolve(__dirname, 'kiebitz'),
        },
    },
    build: {
        outDir: 'build-vite',
    },
});

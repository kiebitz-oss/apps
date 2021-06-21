import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

const ADAPTER_ENV = process.env.ADAPTER_ENV;
const ADAPTER_BASE_PATH = 'src-vite/adapter';

const isTestEnvironment = ADAPTER_ENV === 'test';
const isDevelopmentEnvironment = ADAPTER_ENV === 'dev' || ADAPTER_ENV === 'development';

const ADAPTER_FILE = isTestEnvironment ? 'test.ts' : isDevelopmentEnvironment ? 'dev.ts' : 'production.ts';

console.log(`ADAPTER_FILE=${ADAPTER_FILE}`);

const SETTINGS_ADAPTER_PATH = `${ADAPTER_BASE_PATH}/settings/${ADAPTER_FILE}`;
const BACKEND_ADAPTER_PATH = `${ADAPTER_BASE_PATH}/backend/${ADAPTER_FILE}`;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh()],
    base: '/user/',
    resolve: {
        alias: {
            helpers: path.resolve(__dirname, 'src/helpers'),
            routes: path.resolve(__dirname, 'src/routes'),
            assets: path.resolve(__dirname, 'src/assets'),
            testing: path.resolve(__dirname, 'src/testing'),
            backend: path.resolve(__dirname, 'src/backend'),
            '@/settings': path.resolve(__dirname, SETTINGS_ADAPTER_PATH),
            '@/backend': path.resolve(__dirname, BACKEND_ADAPTER_PATH),
            '@/components': path.resolve(__dirname, 'src-vite/components'),
            '@/features': path.resolve(__dirname, 'src-vite/features'),
            '@/utils': path.resolve(__dirname, 'src-vite/utils'),
            '@/kiebitz': path.resolve(__dirname, 'kiebitz'),
            '@/hooks': path.resolve(__dirname, 'src-vite/hooks'),
            '@/types': path.resolve(__dirname, 'src-vite/types.ts'),
            '@/helpers': path.resolve(__dirname, 'src/helpers'),
        },
    },
    build: {
        outDir: 'build-vite',
    },
});

import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  base: '/user/',
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      helpers: path.resolve(__dirname, 'src/helpers')
    }
  },
  build: {
    outDir: 'build-vite'
  }
});

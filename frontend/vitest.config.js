import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Treat .js files as JSX (Next.js components use JSX in .js files)
const transformJsxInJs = () => ({
  name: 'transform-jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.match(/\.js$/)) return null;
    return await transformWithOxc(code, id, { lang: 'jsx' });
  },
});

export default defineConfig({
  plugins: [react(), transformJsxInJs()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});

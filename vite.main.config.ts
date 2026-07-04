import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node22',
    rollupOptions: {
      external: ['better-sqlite3', 'electron'],
    },
  },
});

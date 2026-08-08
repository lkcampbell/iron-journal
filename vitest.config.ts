import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Mirrors the two src/lib-relevant aliases from @quasar/app-webpack's
// tsconfig-preset.json. Add more here only if a spec actually needs them.
export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      components: resolve(__dirname, 'src/components'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});

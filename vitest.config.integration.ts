import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/integration/**/*.test.ts'],
    testTimeout: 30000, // Longer timeout for emulator tests
  },
  resolve: {
    alias: {
      '@melaka/ai': resolve(__dirname, './packages/ai/src'),
      '@melaka/core': resolve(__dirname, './packages/core/src'),
      '@melaka/firestore': resolve(__dirname, './packages/firestore/src'),
    },
  },
});

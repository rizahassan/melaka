import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/test/**/*.test.ts',
    ],
    exclude: [
      'test/integration/**', // Excluded by default, run with test:integration
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/**/*.test.ts',
        'packages/*/src/**/index.ts',
        'packages/cli/**', // CLI has integration tests instead
      ],
    },
  },
  resolve: {
    alias: {
      '@melaka/ai': resolve(__dirname, './packages/ai/src'),
      '@melaka/core': resolve(__dirname, './packages/core/src'),
      '@melaka/firestore': resolve(__dirname, './packages/firestore/src'),
    },
  },
});

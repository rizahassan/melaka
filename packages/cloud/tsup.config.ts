import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/dashboard.ts'],
  format: ['esm'],
  dts: false, // Skip DTS - causes issues with workspace deps in CI
  splitting: false,
  sourcemap: true,
  clean: true,
});

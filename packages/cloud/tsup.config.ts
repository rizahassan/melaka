import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/dashboard.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  noExternal: [], // Bundle nothing extra
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // CommonJS and ES modules
  dts: true, // .d.ts file generation
  sourcemap: true, // Source maps for debugging
  clean: true, // Output directory cleanup
  minify: true, // Minification
  treeshake: true // Aggressive tree-shaking
});

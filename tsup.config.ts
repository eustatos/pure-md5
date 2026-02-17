import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/adapters/webcrypto.ts',
    'src/adapters/node.ts',
    'src/adapters/ie11.ts',
    'src/utils/detect.ts',
    'src/stream/index.ts',
    'src/stream/whatwg-stream.ts'
  ],
  format: ['cjs', 'esm'], // CommonJS and ES modules
  dts: true, // .d.ts file generation
  sourcemap: true, // Source maps for debugging
  clean: true, // Output directory cleanup
  minify: true, // Minification
  treeshake: true // Aggressive tree-shaking
});

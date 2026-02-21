import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',                    // Main module with all exports
    'src/md5.ts',                      // Minimal md5 entry point (for tree-shaking)
    'src/adapters/node.ts',            // Node.js backend
    'src/adapters/webcrypto.ts',       // WebCrypto backend
    'src/adapters/ie11.ts',            // IE11 backend (legacy)
    'src/utils/detect.ts',             // Backend detection utility
    'src/stream/md5-stream.ts',        // Node.js streaming
    'src/stream/whatwg-stream.ts'      // WHATWG streams (browser)
  ],
  format: ['cjs', 'esm'],              // CommonJS and ES modules
  dts: true,                           // Generate .d.ts files
  sourcemap: false,                    // Disable sourcemaps for production to reduce package size
  clean: true,                         // Output directory cleanup
  minify: true,                        // Minification
  treeshake: true,                     // Aggressive tree-shaking
  bundle: true,                        // Bundle all dependencies into single files
  splitting: false                     // Disable code splitting
});

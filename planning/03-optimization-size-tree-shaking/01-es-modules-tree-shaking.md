# Task 1: Migration from Webpack to tsup

## Context

The current build stack is outdated and excessive:

- **Webpack 4.34.0** (2019)
- **TypeScript 3.5.2** (2019)
- **Babel** for TypeScript transpilation (double transpilation)
- **13 dev dependencies** for building a simple library

**tsup** - modern bundler for TypeScript libraries:

- ⚡ 10-100 times faster than Webpack
- 📦 Native TypeScript support (without Babel)
- 🌳 Excellent tree-shaking
- 🔧 Zero/minimal configuration
- 📄 Automatic .d.ts file generation

## Goal

Replace the outdated Webpack+Babel+TypeScript stack with modern tsup for:

1. Faster builds
2. Better tree-shaking
3. Reduced dependencies
4. Simplified configuration

## Required Actions

### Step 1: Install tsup and Update TypeScript

1. Install tsup and update TypeScript:
   ```bash
   npm install -D tsup typescript@latest
   ```
2. Verify installation: `npx tsup --version`

### Step 2: Remove Outdated Dependencies

1. Remove Webpack, Babel, and related packages:
   ```bash
   npm uninstall -D webpack webpack-cli babel-loader \
     @babel/core @babel/preset-env @babel/preset-typescript \
     @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread
   ```
2. Remove unnecessary configuration files:
   - `webpack.config.js`
   - `.babelrc`

### Step 3: Configure tsup

1. Create `tsup.config.ts` (or use default settings):

   ```typescript
   import { defineConfig } from 'tsup';

   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['cjs', 'esm'], // CommonJS and ES modules
     dts: true, // .d.ts file generation
     sourcemap: true, // Source maps for debugging
     clean: true, // Clean output directory
     minify: true, // Minification
     treeshake: true // Aggressive tree-shaking
   });
   ```

### Step 4: Update TypeScript Configuration

1. Update `tsconfig.json`:
   - Set `"target": "es2020"` (modern standard)
   - Set `"module": "esnext"` for ES modules
   - Add `"moduleResolution": "node"`
   - Update other settings for TypeScript 5+

### Step 5: Update package.json

1. Update scripts:
   ```json
   "scripts": {
     "build": "tsup",
     "build:watch": "tsup --watch",
     "build:prod": "tsup --minify",
     "dev": "tsup --watch"
   }
   ```
2. Update exports fields:
   ```json
   "exports": {
     ".": {
       "import": "./dist/index.mjs",
       "require": "./dist/index.js",
       "types": "./dist/index.d.ts"
     }
   },
   "main": "./dist/index.js",
   "module": "./dist/index.mjs",
   "types": "./dist/index.d.ts"
   ```

### Step 6: Verify Build

1. Run first build: `npm run build`
2. Verify files created in `dist/`:
   - `index.js` (CommonJS)
   - `index.mjs` (ES modules)
   - `index.d.ts` (TypeScript types)
3. Check file sizes

### Step 7: Verify Compatibility

1. Run tests: `npm test`
2. Check import in Node.js:
   ```bash
   node -e "const { md5 } = require('./dist/index.js'); console.log(md5('test'))"
   ```
3. Check import as ES module

### Step 8: Update .gitignore

1. Add `dist/` to .gitignore (if not already)
2. Remove `lib/` from .gitignore (no longer used)

## Expected Result

- Builds are 10-100 times faster
- Dev dependencies reduced from 13 to 3-5 packages
- CommonJS and ES module builds created
- .d.ts files automatically generated
- All tests pass
- Backward compatibility maintained

## Progress Check

- [ ] tsup and TypeScript installed
- [ ] Outdated dependencies removed
- [ ] tsup.config.ts created and configured
- [ ] tsconfig.json updated
- [ ] package.json scripts updated
- [ ] Build works (files created in dist/)
- [ ] Import works in Node.js and as ES module
- [ ] .gitignore updated

## Notes

1. tsup uses `dist/` as output directory by default
2. For UMD format generation, add `format: ['cjs', 'esm', 'iife']`
3. Can configure different entry points for different formats
4. Verify that tree-shaking works correctly

## Next Step

# Migration Guide to tsup

## Overview

This guide describes the migration process from the outdated Webpack+Babel+TypeScript stack to modern tsup.

## Migration Benefits

### Before migration:

- Webpack 4.34.0 (2019)
- TypeScript 3.5.2 (2019)
- Babel for transpilation
- 13 dev dependencies
- Slow builds
- Complex configuration

### After migration:

- tsup (modern)
- TypeScript 5+ (latest version)
- Native TypeScript transpilation
- 3-5 dev dependencies
- 10-100x faster builds
- Minimal configuration

## Step-by-Step Migration Plan

### Step 0: Preparation

1. Ensure all tests pass: `npm test`
2. Create backup of current configuration
3. Check current bundle size (baseline)

### Step 1: Install tsup

```bash
# Install tsup and update TypeScript
npm install -D tsup typescript@latest

# Verify installation
npx tsup --version
npx tsc --version
```

### Step 2: Remove Outdated Dependencies

```bash
# Remove Webpack and Babel
npm uninstall -D webpack webpack-cli babel-loader \
  @babel/core @babel/preset-env @babel/preset-typescript \
  @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread

# Remove configuration files
rm webpack.config.js .babelrc
```

### Step 3: Basic tsup Configuration

Create `tsup.config.ts`:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true
});
```

### Step 4: Update TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### Step 5: Update package.json

```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "dev": "tsup --watch",
    "test": "jest"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Step 6: First Build

```bash
# First build
npm run build

# Check created files
ls -la dist/

# Check sizes
ls -lh dist/*
```

### Step 7: Verification

```bash
# Run tests
npm test

# Check import in Node.js
node -e "const { md5 } = require('./dist/index.js'); console.log(md5('test'))"

# Check as ES module (if supported)
node --loader ts-node/esm -e "import { md5 } from './dist/index.mjs'; console.log(md5('test'))"
```

### Step 8: Additional Configurations

Create additional configurations as needed:

- `tsup.config.prod.ts` - for production
- `tsup.config.umd.ts` - for browser
- `tsup.config.min.ts` - minimal build

## Troubleshooting

### Problem 1: TypeScript Errors After Update

**Solution:**

1. Check TypeScript breaking changes
2. Update types gradually
3. Use `tsc --noEmit` for verification

### Problem 2: .d.ts Files Not Generated

**Solution:**

1. Check that `dts: true` in configuration
2. Ensure TypeScript is properly configured
3. Check with `@arethetypeswrong/cli`

### Problem 3: Tree-Shaking Not Working

**Solution:**

1. Check that `treeshake: true`
2. Ensure ES modules are used
3. Check side effects in package.json

### Problem 4: Import Errors

**Solution:**

1. Check exports in package.json
2. Ensure correct paths
3. Check compatibility with consumers

## Verification Checklist

- [ ] tsup installed
- [ ] Outdated dependencies removed
- [ ] tsup configuration created
- [ ] TypeScript updated and configured
- [ ] package.json updated
- [ ] Build works
- [ ] Tests pass
- [ ] Import works
- [ ] .d.ts files generated
- [ ] Tree-shaking works
- [ ] Bundle size reduced

## Additional Optimizations

### 1. Configuration for Different Formats

```typescript
// tsup.config.prod.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false,
  minify: true,
  treeshake: true
});
```

### 2. Browser Configuration

```typescript
// tsup.config.umd.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  globalName: 'pureMD5',
  minify: true,
  target: 'es2020',
  platform: 'browser'
});
```

### 3. Minimal Build

```typescript
// tsup.config.min.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: false,
  minify: true,
  treeshake: true,
  pure: ['console.log']
});
```

## Resources

- [tsup Documentation](https://tsup.egoist.dev/)
- [TypeScript 5 Breaking Changes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
- [Tree-shaking in tsup](https://tsup.egoist.dev/#tree-shaking)
- [Configuration Examples](https://github.com/egoist/tsup/tree/main/examples)

## Support

If problems occur:

1. Check tsup documentation
2. Create issue in repository
3. Contact TypeScript community

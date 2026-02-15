# Phase 3: Size Optimization and Tree-Shaking Configuration

## Goal

Reduce bundle size, improve tree-shaking, and optimize MD5 implementation performance.

## Current Analysis

### Problems:

1. **Outdated bundler** - Webpack 4 + Babel + TypeScript 3.5 (2019)
2. **CommonJS modules** - poorly suited for tree-shaking in modern bundlers
3. **Many small files** - create import overhead
4. **Runtime check** in `index.ts` increases bundle size
5. **Code duplication** - `add32` is defined in two places
6. **Suboptimal loops** - performance can be improved

### Metrics before optimization:

- Total number of files in `src/`: 16
- Used dependencies: 0 (pure TypeScript)
- Current build: Webpack 4 + Babel + TypeScript 3.5 (outdated stack)
- Dev dependencies: 13 packages (can be reduced)

## Optimization Tasks

### Task 1: Migration from Webpack to tsup

**Goal**: Replace outdated Webpack+Babel+TypeScript stack with modern tsup for faster builds and better tree-shaking.
**Actions:**

1. Install tsup and remove outdated dependencies
2. Configure tsup for TypeScript library builds
3. Update TypeScript to modern version
4. Configure .d.ts file generation

**Expected result:** 10-100x faster builds, improved tree-shaking, reduced dependencies.
**Progress:** [ ] Not started

---

### Task 2: Consolidation of Small Modules

**Goal**: Combine related functions into larger modules to reduce overhead.

**Actions:**

1. Combine `ff.ts`, `gg.ts`, `hh.ts`, `ii.ts` into one module `round-functions.ts`
2. Combine `hex.ts` and `rhex.ts` (or inline rhex)
3. Consider inlining `cmn.ts` into `md5cycle.ts`

**Expected result:** Reduction of file count from 16 to ~10.

**Progress:** [ ] Not started

---

### Task 3: Elimination of Code Duplication

**Goal**: Remove duplication of the `add32` function.

**Actions:**

1. Remove inline definition of `add32` from `index.ts`
2. Ensure import from `add32.ts` is used everywhere
3. Optimize `add32` implementation for performance

**Expected result:** Single implementation of `add32`.

**Progress:** [ ] Not started

---

### Task 4: Moving Runtime Check to Compile-Time

**Goal**: Remove `hex(md51('hello'))` check from runtime.

**Actions:**

1. Create a test to verify MD5 correctness
2. Remove runtime check from `index.ts`
3. Add compile-time check via TypeScript or in the build

**Expected result:** Reduced bundle size and improved performance.

**Progress:** [ ] Not started

---

### Task 5: Loop and Operation Optimization

**Goal**: Improve performance of critical code sections.

**Actions:**

1. Optimize loops in `md51.ts`
2. Improve bit operations in `add32.ts`
3. Consider using typed arrays for performance

**Expected result:** 10-20% performance improvement.

**Progress:** [ ] Not started

---

### Task 6: tsup Configuration for Different Formats

**Goal**: Configure tsup to create different builds for different environments.
**Actions:**

1. Configure tsup to generate CommonJS, ES modules, and UMD
2. Add minification and dead code elimination
3. Configure source maps
4. Create minimal build

**Expected result:** Flexible optimized builds for all environments.
**Progress:** [ ] Not started

---

### Task 7: Bundle Analysis and Metrics

**Goal**: Measure and analyze optimization results.
**Actions:**

1. Install and configure bundle analyzer
2. Measure bundle size before and after optimizations
3. Check tree-shaking effectiveness
4. Create performance benchmarks

**Expected result:** Quantitative improvement metrics, understanding of what can be optimized further.
**Progress:** [ ] Not started

---

### Task 8: Documentation and CI/CD Update

**Goal**: Update documentation and CI/CD for the new stack.
**Actions:**

1. Update README with build instructions
2. Update package.json with new scripts
3. Configure GitHub Actions for the new stack
4. Add automatic benchmarks to CI

**Expected result:** Complete documentation and automated CI/CD.
**Progress:** [ ] Not started

## Success Criteria

1. 10-100x faster builds
2. 20-30% reduction in bundle size
3. Improved tree-shaking (dead code elimination)
4. Reduction of dev dependencies from 13 to 3-5 packages
5. Maintain 100% test coverage
6. Compatibility with all current use cases

## Priorities

1. Migration to tsup (Task 1)
2. Tree-shaking and consolidation (Tasks 2, 6)
3. Size reduction (Tasks 3, 4)
4. Performance and metrics (Tasks 5, 7, 8)

## Risks

1. Breaking backward compatibility
2. Issues with .d.ts file generation
3. Incompatibility with existing consumers

## Next Steps

After completing this phase, move to: 4. File system integration 5. WHATWG Streams support 6. Comprehensive testing and documentation

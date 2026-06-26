---
name: MD5 TDD Bug Fix Workflow
description: Test-Driven Development workflow for fixing MD5 hash computation bugs
source: auto-skill
extracted_at: '2026-06-26T10:26:00.000Z'
---

# MD5 TDD Bug Fix Workflow

This skill describes the TDD approach used to fix MD5 hash computation bugs in the pure-md5 project, specifically for Unicode character handling issues like the em-dash (—) bug reported in issue #21.

## Problem Pattern

The bug involves incorrect MD5 hash computation for Unicode characters. The root cause is typically one of these:

1. **Incorrect Unicode encoding**: Using only the lower 8 bits of UTF-16 code units (`charCodeAt() & 0xff`) instead of proper UTF-8 encoding
2. **Wrong line endings in test fixtures**: Files using CRLF (`\r\n`) instead of LF (`\n`)
3. **Incorrect binary data handling**: Using `toString('binary')` instead of direct buffer hashing

## TDD Fix Procedure

### Step 1: Create a failing test first

Write a test that reproduces the bug before implementing the fix:

```typescript
test('should handle em-dash character correctly (issue #21)', () => {
  // Test with em-dash (—) character
  // Expected hash verified against Node.js crypto implementation
  expect(md5('—')).toBe('26aeabd0c99c77002e55825fbcd435af');
  
  // Test with string containing em-dash
  expect(md5('test—string')).toBe('d25ba991ad3d3deddd0652747ec22a5b');
});
```

**Key points:**
- Use Node.js `crypto.createHash('md5').update().digest('hex')` to verify expected values
- Include both single character and multi-character test cases
- Reference the GitHub issue number in the test name

### Step 2: Identify the root cause

Check these areas in `src/md51.ts`:

1. **Unicode encoding**: Look for `charCodeAt() & 0xff` patterns - this is the most common bug
2. **String slicing**: Check if the code uses `s.substring(i - 64, i)` instead of working with UTF-8 bytes
3. **Block processing**: Verify that blocks are created from proper byte arrays, not string code units

### Step 3: Implement the fix

The correct implementation should:

1. **Convert string to UTF-8 bytes first**:

```typescript
function strToUTF8Bytes(s: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    
    // Handle surrogate pairs for characters outside BMP
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++; // Skip next char (surrogate pair)
      }
    }
    
    if (code <= 0x7f) {
      // 1 byte (ASCII)
      bytes.push(code);
    } else if (code <= 0x7ff) {
      // 2 bytes
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      // 3 bytes
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      // 4 bytes (surrogate pair)
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}
```

2. **Process UTF-8 bytes, not string code units**

3. **Convert byte arrays to number blocks** for `md5cycle`:

```typescript
function uint8ArrayToNumberArray(bytes: Uint8Array | number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < 16; i++) {
    result[i] =
      bytes[i * 4] +
      (bytes[i * 4 + 1] << 8) +
      (bytes[i * 4 + 2] << 16) +
      (bytes[i * 4 + 3] << 24);
  }
  return result;
}
```

### Step 4: Update existing tests

When fixing Unicode handling, update all related tests:

1. **Unicode tests**: Update expected values to match Node.js crypto
2. **File system tests**: Fix line endings (`\r\n` vs `\n`)
3. **Binary data tests**: Use direct buffer hashing, not string conversion

### Step 5: Verify with all backends

After fixing the core implementation:

1. Run `npm test` to verify all tests pass
2. Check that Node.js crypto backend matches the pure JS implementation
3. Verify Web Crypto backend produces consistent results

## Verification Checklist

- [ ] Failing test added before implementation
- [ ] Expected values verified against Node.js `crypto` module
- [ ] UTF-8 encoding handles surrogate pairs correctly
- [ ] All 228 tests pass (226 passing, 2 skipped)
- [ ] Test names reference GitHub issue numbers
- [ ] Comment in code explains UTF-8 encoding choice

## Cross-Platform File Testing

When tests involve hashing fixture files, **never hardcode expected hashes from string literals** — line endings differ across platforms (CRLF on Windows, LF on Linux/macOS).

### Solution: Compute expected hash from actual file bytes

```typescript
import crypto from 'crypto';
import fs from 'fs';

/** Compute expected MD5 hash from file bytes (platform-independent) */
function fileMD5(filePath: string): string {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

// In tests:
test('should hash a text file correctly', async () => {
  const result = await hashFile(testFile);
  const expected = fileMD5(testFile);
  const fileSize = fs.statSync(testFile).size;

  expect(result.digest).toBe(expected);
  expect(result.bytesProcessed).toBe(fileSize);
});
```

### Also add `.gitattributes` for fixture normalization

```
# Ensure test files use Unix line endings
__tests__/integration/fixtures/* text eol=lf
```

### Why this matters

- `test-file.txt` with `Hello, World!\n` has 14 bytes on Linux → MD5 `bea8252ff4e80f41719ea13cdf007273`
- Same file with `Hello, World!\r\n` has 15 bytes on Windows → MD5 `29b933a8d9a0fcef0af75f1713f4940e`
- Git `core.autocrlf` can silently convert line endings on checkout
- CI (GitHub Actions) runs on Linux, local dev may be on Windows

## Common Pitfalls

1. **UTF-16 vs UTF-8 confusion**: The old code used UTF-16 code units with `& 0xff` mask - this is wrong for Unicode
2. **Line ending differences**: Windows files use CRLF, tests may expect LF — use `fileMD5()` helper instead of hardcoded strings
3. **Buffer toString() bugs**: `toString('binary')` produces different results than direct buffer hashing
4. **Build caching**: Run `npm run build` after changes if testing the built version
5. **Hardcoded byte sizes**: Use `fs.statSync(file).size` instead of hardcoded byte counts for fixture files

## Related Files

- `src/md51.ts` - Core MD5 implementation (primary fix target)
- `src/md5cycle.ts` - MD5 cycle function (may need block conversion helper)
- `src/md5blk.ts` - Block processing (legacy, may need updates)
- `src/hex.ts` - Hex conversion (may need updates)
- `__tests__/index.test.ts` - Main MD5 tests
- `__tests__/adapters/*.test.ts` - Backend adapter tests
- `__tests__/stream/*.test.ts` - Stream tests
- `__tests__/integration/fixtures/` - Test fixture files

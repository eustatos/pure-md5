# Streaming API Troubleshooting Guide

This guide helps you diagnose and resolve common issues when using the MD5 streaming API.

## Common Issues

### 1. Stream not emitting 'md5' event

**Symptom:**
```typescript
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log(result.digest); // Never called
});
stream.write('data');
// No 'md5' event emitted
```

**Causes and Solutions:**

**Cause 1:** Stream not ended

```typescript
// Wrong
const stream = new MD5Stream();
stream.on('md5', (result) => console.log(result.digest));
stream.write('data');
// Missing stream.end()

// Correct
stream.end('data');
```

**Cause 2:** Listening to 'md5' after writing

```typescript
// Wrong
const stream = new MD5Stream();
stream.write('data'); // Data processed immediately
stream.on('md5', (result) => console.log(result.digest)); // Too late!

// Correct
const stream = new MD5Stream();
stream.on('md5', (result) => console.log(result.digest));
stream.end('data');
```

**Cause 3:** Empty data without end

```typescript
// Wrong
const stream = new MD5Stream();
stream.write('');
stream.on('md5', (result) => console.log(result.digest));
// 'md5' only emitted after end()

// Correct
stream.end('');
```

---

### 2. Different hash values between implementations

**Symptom:**
```
Expected: 5d41402abc4b2a76b9719d911017c592 (MD5 of "hello")
Got:      8b1a9953c4611296a827abf8c47804d7
```

**Causes and Solutions:**

**Cause 1:** Different data encoding

```typescript
// Wrong - string vs buffer
stream.end('hello'); // String
// vs
stream.end(Buffer.from([104, 101, 108, 108, 111])); // Same data

// Both should work if data is equivalent
```

**Cause 2:** Extra whitespace or characters

```typescript
// Wrong
const data1 = 'hello';     // 5 bytes
const data2 = 'hello\n';   // 6 bytes (includes newline)

// Check exact bytes
console.log(Buffer.byteLength('hello')); // 5
console.log(Buffer.byteLength('hello\n')); // 6
```

**Cause 3:** Different add32 function in testing

```typescript
// If using custom add32, results may differ
const customAdd32 = (x, y) => (x + y) & 0xffffffff;
const stream = new MD5Stream({ add32: customAdd32 });
// Results may not match standard MD5

// For standard MD5, omit add32 option
const stream = new MD5Stream();
```

---

### 3. Memory issues with large files

**Symptom:**
```
FATAL ERROR: Ineffective mark-compact near heap limit
```

**Causes and Solutions:**

**Cause 1:** Loading entire file into memory

```typescript
// Wrong
const data = fs.readFileSync('large-file.bin'); // Loads entire file!
const stream = new MD5Stream();
stream.end(data);

// Correct - streaming
const stream = new MD5Stream();
fs.createReadStream('large-file.bin').pipe(stream);
```

**Cause 2:** Large chunk sizes

```typescript
// Wrong - too much data in memory at once
const largeData = 'a'.repeat(100 * 1024 * 1024); // 100MB
stream.end(largeData);

// Correct - chunked writing
const chunkSize = 64 * 1024; // 64KB chunks
for (let i = 0; i < data.length; i += chunkSize) {
  const chunk = data.substring(i, i + chunkSize);
  stream.write(chunk);
}
stream.end();
```

**Cause 3:** Not reusing stream instances

```typescript
// Wrong - creates many stream instances
files.forEach(file => {
  const stream = new MD5Stream();
  // ... hash file
});

// Correct - reuse or single use
const stream = new MD5Stream();
files.forEach(file => {
  // ... hash file
  stream.reset();
});
```

---

### 4. Stream errors not being handled

**Symptom:**
```
Uncaught Error: ENOENT: no such file or directory
```

**Solution:**

```typescript
const stream = new MD5Stream();

stream.on('error', (error) => {
  console.error('Stream error:', error.message);
});

stream.on('md5', (result) => {
  console.log('MD5:', result.digest);
});

fs.createReadStream('nonexistent.txt').pipe(stream);
```

**Also:**

```typescript
const { stream, result } = fromStream(fs.createReadStream('file.txt'));

result.catch((error) => {
  console.error('Hashing error:', error.message);
});
```

---

### 5. Browser: FileReader not working

**Symptom:**
```
ReferenceError: FileReader is not defined
```

**Cause:**
FileReader is not available in all Node.js environments.

**Solutions:**

**Solution 1:** Check availability

```typescript
if (typeof FileReader !== 'undefined') {
  // Use FileReader
} else {
  // Fallback for Node.js
}
```

**Solution 2:** Use direct hashBlob

```typescript
import { hashBlob } from 'pure-md5';

const blob = new Blob([data]);
const result = await hashBlob(blob);
```

**Solution 3:** Polyfill WHATWG Streams

```html
<script src="https://cdn.jsdelivr.net/npm/web-streams-polyfill@3/dist/polyfill.min.js"></script>
<script>
  // Now WHATWG Streams work
  const stream = new ReadableStream(...);
</script>
```

---

### 6. Unicode character encoding issues

**Symptom:**
```
MD5 of "café" differs between implementations
```

**Cause:**
Different character encoding (UTF-8 vs UTF-16).

**Solution:**

```typescript
import { MD5Stream } from 'pure-md5';

const text = 'café';

// Node.js Buffer uses UTF-8 by default
const stream = new MD5Stream();
let result = '';
stream.on('md5', (r) => result = r.digest);
stream.end(text); // UTF-8 encoding

// To verify encoding
console.log(Buffer.byteLength(text, 'utf8')); // 5 bytes for "café"
```

---

### 7. reset() not working as expected

**Symptom:**
```typescript
const stream = new MD5Stream();
stream.write('first');
stream.reset();
stream.write('second');
// Still getting hash of 'first'
```

**Cause:**
Stream already ended, then reset.

**Solution:**

```typescript
const stream = new MD5Stream();

// First computation
stream.on('md5', (result) => {
  console.log('First:', result.digest);
  
  // Reset ONLY after first computation completes
  stream.reset();
  
  // Start new computation
  stream.write('second');
  stream.end();
});

stream.on('md5', (result) => {
  console.log('Second:', result.digest);
});

stream.write('first');
stream.end();
```

**Better approach:**

```typescript
// Use separate instances
const stream1 = new MD5Stream();
stream1.on('md5', (result) => console.log('First:', result.digest));
stream1.write('first');
stream1.end();

const stream2 = new MD5Stream();
stream2.on('md5', (result) => console.log('Second:', result.digest));
stream2.write('second');
stream2.end();
```

---

### 8. Async/await with MD5Stream

**Symptom:**
```
SyntaxError: await is only valid in async function
```

**Solution:**

```typescript
// Wrong - await not in async function
const stream = new MD5Stream();
let result;
stream.on('md5', (r) => result = r);
stream.end('data');
await new Promise(resolve => stream.on('finish', resolve)); // Error!

// Correct - wrap in async function
async function hashString(data) {
  return new Promise((resolve, reject) => {
    const stream = new MD5Stream();
    stream.on('md5', (result) => resolve(result));
    stream.on('error', reject);
    stream.end(data);
  });
}

// Usage
const result = await hashString('data');
console.log(result.digest);
```

**Alternative with fromStream:**

```typescript
import { fromStream } from 'pure-md5';
import { Readable } from 'stream';

const { result } = fromStream(Readable.from(['data']));
const resultData = await result;
console.log(resultData.digest);
```

---

### 9. Chunked data not processed correctly

**Symptom:**
```typescript
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log(result.digest);
});
stream.write('he');
stream.write('llo');
// Only "he" is being hashed
```

**Cause:**
Not ending the stream after all chunks.

**Solution:**

```typescript
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log(result.digest); // Now shows hash of "hello"
});
stream.write('he');
stream.write('llo');
stream.end(); // Must end stream
```

---

### 10. Type errors in TypeScript

**Symptom:**
```
TS2304: Cannot find name 'Readable'
```

**Solution:**

```typescript
import { MD5Stream, fromStream } from 'pure-md5';
import { Readable } from 'stream'; // Import Readable

const source = Readable.from(['data']);
const { result } = fromStream(source);
```

---

## Testing and Debugging

### Debugging State

```typescript
const stream = new MD5Stream();

console.log('Initial:', stream.getCurrentState());

stream.write('test');
console.log('After write:', stream.getCurrentState());

console.log('Bytes processed:', stream.getBytesProcessed());

stream.on('md5', (result) => {
  console.log('Final digest:', result.digest);
});
```

### Verifying Hash Correctness

```typescript
import { md5Core } from 'pure-md5';
import { MD5Stream } from 'pure-md5';

const testString = 'The quick brown fox jumps over the lazy dog';
const expectedHash = md5Core(testString); // Known correct MD5

const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log('Expected:', expectedHash);
  console.log('Got:     ', result.digest);
  console.log('Match:   ', result.digest === expectedHash);
});

stream.end(testString);
```

### Testing with Known Values

```
MD5("") = d41d8cd98f00b204e9800998ecf8427e
MD5("a") = 0cc175b9c0f1b6a831c399e269772661
MD5("abc") = 900150983cd24fb0d6963f7d28e17f72
MD5("message digest") = f96b697d7cb7938d525a2f31aaf161d0
MD5("abcdefghijklmnopqrstuvwxyz") = c3fcd3d76192e4007dfb496cca67e13b
```

Use these to verify your implementation:

```typescript
const testCases = [
  { input: '', expected: 'd41d8cd98f00b204e9800998ecf8427e' },
  { input: 'a', expected: '0cc175b9c0f1b6a831c399e269772661' },
  { input: 'abc', expected: '900150983cd24fb0d6963f7d28e17f72' },
];

for (const test of testCases) {
  const stream = new MD5Stream();
  stream.on('md5', (result) => {
    const pass = result.digest === test.expected;
    console.log(`Test "${test.input}": ${pass ? 'PASS' : 'FAIL'}`);
  });
  stream.end(test.input);
}
```

---

## Best Practices

1. **Always handle errors:**
   ```typescript
   stream.on('error', (error) => console.error(error));
   ```

2. **End streams properly:**
   ```typescript
   stream.end(); // Always call end()
   ```

3. **Check data consistency:**
   ```typescript
   console.log('Expected:', expected);
   console.log('Got:     ', result.digest);
   ```

4. **Use appropriate chunk sizes:**
   ```typescript
   // 64KB is optimal for most cases
   const chunkSize = 64 * 1024;
   ```

5. **Reuse streams when appropriate:**
   ```typescript
   const stream = new MD5Stream();
   // ... use stream
   stream.reset();
   // ... use again
   ```

---

## Getting Help

If you're still having issues:

1. Check this troubleshooting guide
2. Review the [API documentation](STREAM_API.md)
3. Check existing tests in `__tests__/stream/`
4. Open an issue with:
   - Your code example
   - Expected vs actual behavior
   - Environment details (Node.js version, browser, OS)

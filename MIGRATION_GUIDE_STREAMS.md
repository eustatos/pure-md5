# Migration Guide: Node.js Streams to pure-md5

This guide helps you migrate from native Node.js crypto or other MD5 libraries to the pure-md5 streaming API.

## From crypto.createHash()

### Basic String Hashing

**Before:**
```typescript
import crypto from 'crypto';

const data = 'Hello, World!';
const hash = crypto.createHash('md5').update(data).digest('hex');
console.log(hash); // 65a8e27d8879283831b664bd8b7f0ad4
```

**After:**
```typescript
import { MD5Stream, fromStream } from 'pure-md5';
import { Readable } from 'stream';

// Method 1: Using fromStream
const { result } = fromStream(Readable.from([data]));
console.log(result.digest); // 65a8e27d8879283831b664bd8b7f0ad4

// Method 2: Using MD5Stream with manual piping
const stream = new MD5Stream();
let digest = '';
stream.on('md5', (r) => digest = r.digest);
stream.end(data);

// Method 3: Using pipeThroughMD5
const result = await pipeThroughMD5(Readable.from([data]));
console.log(result.digest);
```

### File Hashing

**Before:**
```typescript
import crypto from 'crypto';
import fs from 'fs';

const hash = crypto.createHash('md5');
const stream = fs.createReadStream('file.txt');

stream.on('data', (chunk) => {
  hash.update(chunk);
});

stream.on('end', () => {
  console.log(hash.digest('hex'));
});
```

**After:**
```typescript
import { MD5Stream, hashFile } from 'pure-md5';
import fs from 'fs';

// Method 1: Using MD5Stream
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log(result.digest);
});
fs.createReadStream('file.txt').pipe(stream);

// Method 2: Using hashFile (simpler)
const result = await hashFile('file.txt');
console.log(result.digest);

// Method 3: Using pipeThroughMD5
const source = fs.createReadStream('file.txt');
const result = await pipeThroughMD5(source);
console.log(result.digest);
```

## From crypto.createHash() with Progress

**Before:**
```typescript
import crypto from 'crypto';
import fs from 'fs';

const hash = crypto.createHash('md5');
const stream = fs.createReadStream('large-file.bin');
let total = 0;
const fileSize = fs.statSync('large-file.bin').size;

stream.on('data', (chunk) => {
  hash.update(chunk);
  total += chunk.length;
  const progress = ((total / fileSize) * 100).toFixed(1);
  console.log(`Progress: ${progress}%`);
});

stream.on('end', () => {
  console.log('MD5:', hash.digest('hex'));
});
```

**After:**
```typescript
import { MD5Stream, createProgressTracker } from 'pure-md5';
import fs from 'fs';

const fileSize = fs.statSync('large-file.bin').size;
const progress = createProgressTracker(fileSize, (percent) => {
  console.log(`Progress: ${percent.toFixed(1)}%`);
});

const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log('MD5:', result.digest);
  console.log('Bytes:', result.bytesProcessed);
});

// Note: Current version doesn't have built-in progress
// You can still track progress manually:
let processed = 0;
stream.on('data', (chunk) => {
  processed += chunk.length;
  const percent = ((processed / fileSize) * 100).toFixed(1);
  console.log(`Progress: ${percent}%`);
});

fs.createReadStream('large-file.bin').pipe(stream);
```

## From Third-Party MD5 Libraries

### From js-md5

**Before:**
```javascript
import md5 from 'js-md5';

// String
console.log(md5('Hello'));

// ArrayBuffer
const arrayBuffer = new TextEncoder().encode('Hello').buffer;
console.log(md5(arrayBuffer));

// Uint8Array
const uint8Array = new TextEncoder().encode('Hello');
console.log(md5(uint8Array));
```

**After:**
```typescript
import { MD5Stream } from 'pure-md5';

// String
const stream1 = new MD5Stream();
let result1 = '';
stream1.on('md5', (r) => result1 = r.digest);
stream1.end('Hello');

// ArrayBuffer
const stream2 = new MD5Stream();
let result2 = '';
stream2.on('md5', (r) => result2 = r.digest);
const buffer = new TextEncoder().encode('Hello').buffer;
stream2.end(new Uint8Array(buffer));

// Uint8Array
const stream3 = new MD5Stream();
let result3 = '';
stream3.on('md5', (r) => result3 = r.digest);
const uint8Array = new TextEncoder().encode('Hello');
stream3.end(uint8Array);
```

### From blueimp-md5

**Before:**
```javascript
import md5 from 'blueimp-md5';

// String
md5('Hello'); // "8b1a9953c4611296a827abf8c47804d7"

// File (browser)
const file = document.querySelector('input').files[0];
const reader = new FileReader();
reader.onload = function() {
  const hash = md5(reader.result);
  console.log(hash);
};
reader.readAsBinaryString(file);
```

**After:**
```typescript
import { MD5Stream, hashFile, hashBlob } from 'pure-md5';

// String
const stream = new MD5Stream();
let result = '';
stream.on('md5', (r) => result = r.digest);
stream.end('Hello');

// File (browser)
const file = document.querySelector('input').files[0];
const result = await hashFile(file);
console.log(result.digest);

// Blob (browser)
const blob = new Blob(['Hello']);
const result = await hashBlob(blob);
console.log(result.digest);
```

## Browser Migration

### From Manual MD5 Implementation

**Before:**
```javascript
async function md5Browser(data) {
  const buffer = await data.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('MD5', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

**After:**
```typescript
import { hashFile, hashBlob, MD5ReadableStream } from 'pure-md5';

// For File
const file = document.querySelector('input').files[0];
const result = await hashFile(file);

// For Blob
const blob = new Blob([data]);
const result = await hashBlob(blob);

// For custom ReadableStream
const source = new ReadableStream({ ... });
const result = await MD5ReadableStream.hash(source);
```

## API Comparison

### crypto.createHash() Style

| crypto | pure-md5 |
|--------|----------|
| `update(chunk)` | `stream.write(chunk)` |
| `digest('hex')` | Listen to `md5` event |
| No built-in streaming | Built-in Transform stream |
| No progress tracking | Manual progress via 'data' event |

### File Operations

| crypto | pure-md5 |
|--------|----------|
| Manual file stream | `hashFile('path')` |
| Manual hash computation | `hashFileSync('path')` |
| Manual verification | `verifyFile('path', hash)` |

## Migration Checklist

- [ ] Identify all uses of `crypto.createHash('md5')`
- [ ] Replace with `MD5Stream` or `fromStream` for streaming
- [ ] Use `hashFile` for simple file hashing
- [ ] Update event handlers from 'end' to 'md5'
- [ ] Replace 'data' handler usage with MD5 event
- [ ] Update type imports
- [ ] Test with various input sizes
- [ ] Verify hash outputs match expected values

## Common Patterns

### Pattern 1: Simple File Hash

```typescript
// All of these are equivalent:
const result1 = await hashFile('file.txt');
const result2 = await pipeThroughMD5(fs.createReadStream('file.txt'));
const { result } = fromStream(fs.createReadStream('file.txt'));
```

### Pattern 2: Memory-Efficient Large File Hash

```typescript
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log('Hash:', result.digest);
  console.log('Size:', result.bytesProcessed);
});
fs.createReadStream('large-file.bin').pipe(stream);
```

### Pattern 3: Concurrent File Hashing

```typescript
const files = ['file1.txt', 'file2.txt', 'file3.txt'];
const results = await Promise.all(files.map(f => hashFile(f)));
```

## Troubleshooting

### Issue: "digest is not a function"

**Cause:** Using crypto API incorrectly

**Solution:**
```typescript
// Wrong
const stream = crypto.createHash('md5');
stream.end(data);
console.log(stream.digest); // Error: digest is not a function

// Right
const stream = crypto.createHash('md5');
stream.end(data);
console.log(stream.digest('hex')); // Pass 'hex' argument
```

### Issue: Hash values don't match

**Cause:** Different encoding or data format

**Solution:**
```typescript
// Ensure consistent encoding
const data = 'Hello';
const stream = new MD5Stream();
let result = '';
stream.on('md5', (r) => result = r.digest);
stream.end(data); // This matches crypto.createHash('md5').update(data, 'utf8')

// For binary data, use Buffer
const binaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
stream.end(binaryData);
```

### Issue: Stream not emitting 'md5' event

**Cause:** Not ending the stream

**Solution:**
```typescript
const stream = new MD5Stream();
stream.on('md5', (result) => console.log(result.digest));
stream.write('Hello');
stream.end(); // Must call end() to trigger 'md5' event
```

## Performance Notes

The pure-md5 streaming implementation is designed for:

- **Memory efficiency:** Processes data in chunks, doesn't load entire file
- **Compatibility:** Works in both Node.js and browser environments
- **Flexibility:** Multiple API styles for different use cases

For maximum performance with large files:

1. Use 64KB chunk sizes when manually writing
2. Reuse stream instances with `reset()`
3. Avoid unnecessary data copies

## See Also

- [STREAM_API.md](STREAM_API.md) - Complete API documentation
- [README.md](README.md) - Basic usage examples
- [WHATWG_STREAMS.md](WHATWG_STREAMS.md) - Browser streaming guide

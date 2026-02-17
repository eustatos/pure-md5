# Streaming API Documentation

## Overview

The `pure-md5` library provides comprehensive streaming support for hashing large files and data streams. This includes both Node.js Streams and WHATWG Streams (for browser environments).

## Node.js Streams API

### MD5Stream Class

A Node.js Transform stream for computing MD5 hashes while processing data.

#### Constructor

```typescript
new MD5Stream(options?: MD5StreamOptions)
```

**Parameters:**

- `options` (optional): Stream options
  - `add32` (optional): Custom add32 function for testing/compatibility

**Example:**

```typescript
import { MD5Stream } from 'pure-md5';
import fs from 'fs';

const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log('MD5:', result.digest);
  console.log('Bytes:', result.bytesProcessed);
});

fs.createReadStream('file.txt').pipe(stream);
```

#### Events

**`md5` Event**

Emitted when MD5 computation is complete.

```typescript
stream.on('md5', (result: MD5Result) => {
  console.log('MD5:', result.digest);      // 32-character hex string
  console.log('Bytes:', result.bytesProcessed); // Total bytes processed
});
```

#### Methods

**`getCurrentState(): { state: number[]; bytesProcessed: number }`**

Get current internal MD5 state (for debugging/testing).

```typescript
const stream = new MD5Stream();
stream.write('test');
const state = stream.getCurrentState();
console.log('State:', state.state); // [1732584193, -271733879, ...]
console.log('Bytes:', state.bytesProcessed); // 4
```

**`getBytesProcessed(): number`**

Get the total number of bytes processed so far.

```typescript
const stream = new MD5Stream();
stream.write('hello');
console.log(stream.getBytesProcessed()); // 5
```

**`reset(): void`**

Reset the internal MD5 state. Allows reusing the stream instance.

```typescript
const stream = new MD5Stream();

// First computation
stream.write('first');
stream.end();

// Reset and start new computation
stream.reset();
stream.write('second');
stream.end();
```

#### Static Methods

**`fromStream(source: Readable, options?: MD5StreamOptions): { stream: MD5Stream; result: Promise<MD5Result> }`**

Create an MD5Stream from an existing readable stream.

```typescript
import { Readable } from 'stream';

const source = Readable.from(['hello', ' ', 'world']);
const { stream, result } = MD5Stream.fromStream(source);

result.then(r => {
  console.log('MD5:', r.digest);
  console.log('Bytes:', r.bytesProcessed);
});
```

### Factory Functions

**`createMD5Stream(options?: MD5StreamOptions): MD5Stream`**

Create a new MD5Stream instance.

```typescript
import { createMD5Stream } from 'pure-md5';

const stream = createMD5Stream();
// Use stream...
```

### Helper Functions

**`pipeThroughMD5(source: Readable, options?: MD5StreamOptions): Promise<MD5Result>`**

Pipe a readable stream through an MD5 computation and return the result.

```typescript
import { Readable, Transform } from 'stream';
import { pipeThroughMD5 } from 'pure-md5';

const source = Readable.from(['hello', ' ', 'world']);
const result = await pipeThroughMD5(source);

console.log('MD5:', result.digest);
```

**`fromStream(source: Readable, options?: MD5StreamOptions): { stream: MD5Stream; result: Promise<MD5Result> }`**

Create an MD5Stream and pipe a source through it.

```typescript
import { fromStream } from 'pure-md5';
import fs from 'fs';

const { stream, result } = fromStream(fs.createReadStream('file.txt'));

result.then(r => console.log('MD5:', r.digest));
```

### Result Type

```typescript
interface MD5Result {
  digest: string;       // MD5 hash as hex string (32 characters)
  bytesProcessed: number; // Total bytes processed
}
```

## File System Utilities

### hashFile

Async file hashing with full result.

```typescript
import { hashFile } from 'pure-md5';

const result = await hashFile('path/to/file.txt');
console.log('MD5:', result.digest);
console.log('Bytes:', result.bytesProcessed);
```

**Options:**

```typescript
interface HashFileOptions {
  add32?: (x: number, y: number) => number; // Custom add32 function
}
```

### hashFileSync

Synchronous file hashing (for small files).

```typescript
import { hashFileSync } from 'pure-md5';

const digest = hashFileSync('path/to/file.txt');
console.log('MD5:', digest);
```

### hashFileDigest

Get only the digest string (no bytes processed info).

```typescript
import { hashFileDigest } from 'pure-md5';

const digest = await hashFileDigest('path/to/file.txt');
console.log('MD5:', digest);
```

### verifyFile

Verify file integrity against a known hash.

```typescript
import { verifyFile } from 'pure-md5';

const isVerified = await verifyFile(
  'path/to/file.txt',
  '5d41402abc4b2a76b9719d911017c592'
);

if (isVerified) {
  console.log('File verified successfully!');
} else {
  console.log('File verification failed!');
}
```

## WHATWG Streams API (Browser)

### MD5ReadableStream

A wrapper for computing MD5 while reading from a ReadableStream.

#### Constructor

```typescript
new MD5ReadableStream(source: ReadableStream, options?: MD5ReadableStreamOptions)
```

**Example:**

```typescript
import { MD5ReadableStream } from 'pure-md5';

const source = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('Hello World'));
    controller.close();
  }
});

const stream = new MD5ReadableStream(source);
const result = await stream.getResult();
console.log('MD5:', result.digest);
```

#### Methods

**`getReader(): ReadableStreamDefaultReader<Uint8Array>`**

Get a reader for the stream.

**`getResult(): Promise<MD5Result>`**

Get the MD5 result.

**`getCurrentState(): { state: number[]; bytesProcessed: number }`**

Get current internal state.

**`getBytesProcessed(): number`**

Get bytes processed so far.

#### Static Methods

**`hash(source: ReadableStream, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a stream directly.

```typescript
const result = await MD5ReadableStream.hash(source);
```

**`hashFile(file: File, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a File object.

```typescript
const input = document.querySelector('input[type="file"]');
const file = input.files[0];
const result = await MD5ReadableStream.hashFile(file);
```

**`hashBlob(blob: Blob, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a Blob object.

```typescript
const canvas = document.querySelector('canvas');
canvas.toBlob(async (blob) => {
  const result = await MD5ReadableStream.hashBlob(blob!);
  console.log('MD5:', result.digest);
});
```

### Factory Functions

**`createMD5ReadableStream(source: ReadableStream, options?: MD5ReadableStreamOptions): MD5ReadableStream`**

Create a new MD5ReadableStream instance.

### Standalone Functions

**`hashReadableStream(stream: ReadableStream, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a ReadableStream.

**`hashFile(file: File, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a File object.

**`hashBlob(blob: Blob, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Hash a Blob object.

**`consumeWithMD5(source: ReadableStream, options?: MD5ReadableStreamOptions): Promise<MD5Result>`**

Consume a stream while computing MD5.

## Usage Examples

### Example 1: Hash a Large File

```typescript
import { MD5Stream } from 'pure-md5';
import fs from 'fs';

const stream = new MD5Stream();
let bytesProcessed = 0;

stream.on('md5', (result) => {
  console.log('MD5:', result.digest);
  console.log('Total bytes:', result.bytesProcessed);
});

stream.on('data', (chunk) => {
  bytesProcessed += chunk.length;
  const progress = (bytesProcessed / fileSize * 100).toFixed(1);
  console.log(`Progress: ${progress}%`);
});

fs.createReadStream('large-file.bin').pipe(stream);
```

### Example 2: Browser File Upload with Progress

```typescript
import { MD5ReadableStream } from 'pure-md5';

async function uploadWithHash(file: File): Promise<void> {
  const fileStream = file.stream();
  const md5Stream = new MD5ReadableStream(fileStream);
  
  const reader = md5Stream.getReader();
  let bytesProcessed = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    bytesProcessed += value.length;
    const progress = (bytesProcessed / file.size * 100).toFixed(1);
    console.log(`Upload progress: ${progress}%`);
  }
  
  const result = await md5Stream.getResult();
  console.log('Upload complete. MD5:', result.digest);
  
  // Upload file with hash...
}
```

### Example 3: Verify Downloaded File

```typescript
import { verifyFile } from 'pure-md5';

async function verifyDownload(url: string, expectedHash: string): Promise<boolean> {
  const response = await fetch(url);
  const blob = await response.blob();
  
  // Create a File from Blob
  const file = new File([blob], 'downloaded-file.bin', { type: blob.type });
  
  const isVerified = await verifyFile(file, expectedHash);
  return isVerified;
}
```

### Example 4: Hash Multiple Files Concurrently

```typescript
import { hashFile } from 'pure-md5';
import fs from 'fs';

async function hashFilesConcurrently(files: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  const promises = files.map(async (file) => {
    const result = await hashFile(file);
    return [file, result.digest] as const;
  });
  
  const resolved = await Promise.all(promises);
  resolved.forEach(([file, digest]) => results.set(file, digest));
  
  return results;
}

// Usage
const fileHashes = await hashFilesConcurrently(['file1.txt', 'file2.txt', 'file3.txt']);
fileHashes.forEach((hash, file) => console.log(`${file}: ${hash}`));
```

### Example 5: Streaming Data with Progress

```typescript
import { MD5Stream } from 'pure-md5';

async function streamWithProgress(source: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = new MD5Stream();
    const totalSize = 1000000; // Known total size
    let processed = 0;
    
    stream.on('md5', (result) => {
      console.log('Complete! MD5:', result.digest);
      resolve(result.digest);
    });
    
    stream.on('data', (chunk) => {
      processed += chunk.length;
      const progress = ((processed / totalSize) * 100).toFixed(1);
      console.log(`Processing: ${progress}%`);
    });
    
    source.pipe(stream);
  });
}
```

## Error Handling

### Node.js Streams

```typescript
import { MD5Stream } from 'pure-md5';

const stream = new MD5Stream();

stream.on('error', (error) => {
  console.error('Stream error:', error.message);
});

stream.on('md5', (result) => {
  console.log('Success:', result.digest);
});

// Error will be caught by 'error' handler
fs.createReadStream('nonexistent.txt').pipe(stream);
```

### WHATWG Streams

```typescript
import { MD5ReadableStream } from 'pure-md5';

try {
  const stream = new MD5ReadableStream(source);
  const result = await stream.getResult();
  console.log('Success:', result.digest);
} catch (error) {
  console.error('Stream error:', error.message);
}
```

## Performance Tips

1. **Use 64KB chunks** for optimal performance with Node.js streams
2. **Reuse stream instances** with `reset()` when processing multiple files
3. **For browser**, use `hashBlob()` or `hashFile()` directly for File/Blob objects
4. **Monitor memory usage** with very large files (use streaming, not full load)
5. **Consider parallel processing** for multiple independent files

## Migration Guide

### From crypto.createHash()

**Before:**
```typescript
import crypto from 'crypto';

const hash = crypto.createHash('md5').update(data).digest('hex');
```

**After:**
```typescript
import { MD5Stream } from 'pure-md5';

// For strings
const stream = new MD5Stream();
let digest = '';
stream.on('md5', (result) => digest = result.digest);
stream.end(data);

// Or use fromStream
const { result } = fromStream(Readable.from([data]));
const digest = await result;
```

### From browser-based hashing

**Before:**
```typescript
// Manual implementation
const buffer = await file.arrayBuffer();
const hashBuffer = await crypto.subtle.digest('MD5', buffer);
// ... convert to hex
```

**After:**
```typescript
import { hashFile } from 'pure-md5';

const result = await hashFile(file);
const digest = result.digest;
```

## Browser Compatibility

WHATWG Streams API requires modern browsers:
- Chrome 52+
- Firefox 57+
- Safari 12.1+
- Edge 79+

For older browsers, consider using a WHATWG Streams polyfill.

## FAQ

**Q: Which API should I use for Node.js?**
A: Use `MD5Stream` or the file utilities (`hashFile`, `hashFileSync`).

**Q: Which API should I use in the browser?**
A: Use `MD5ReadableStream` or the standalone functions (`hashFile`, `hashBlob`).

**Q: How do I track progress?**
A: Listen to 'data' events in Node.js or use the reader in WHATWG streams.

**Q: Can I hash data that doesn't fit in memory?**
A: Yes! Use streaming APIs to process data in chunks.

**Q: Is the stream API thread-safe?**
A: Yes, each stream instance maintains its own state.

**Q: What's the difference between `fromStream` and `pipeThroughMD5`?**
A: `fromStream` returns both stream and result for more control, while `pipeThroughMD5` is a convenience function that handles piping automatically.

## Performance Benchmarks

See `STREAM_OPTIMIZATION_REPORT.md` for detailed performance metrics.

| File Size | MD5Stream (ms) | Native (ms) | Ratio |
|-----------|----------------|-------------|-------|
| 1 KB      | 0.15           | 0.08        | 1.88x |
| 1 MB      | 5.23           | 4.12        | 1.27x |
| 10 MB     | 48.67          | 38.45       | 1.27x |
| 100 MB    | 482.34         | 389.21      | 1.24x |

## See Also

- [README.md](README.md) - Basic MD5 usage
- [STREAM_OPTIMIZATION_REPORT.md](STREAM_OPTIMIZATION_REPORT.md) - Performance details
- [WHATWG_STREAMS.md](WHATWG_STREAMS.md) - Browser streaming guide

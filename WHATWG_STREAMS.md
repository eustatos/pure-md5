# WHATWG Streams Support

The `pure-md5` library now supports browser streams through WHATWG Streams API, allowing you to hash files, blobs, and readable streams in browser environments.

## Features

- **MD5ReadableStream**: A wrapper class that computes MD5 while reading from a ReadableStream
- **hashFile**: Hash a File object directly
- **hashBlob**: Hash a Blob object directly  
- **hashReadableStream**: Hash any ReadableStream
- **MD5ReadableStream.hash**: Static method for hashing streams

## Usage

### Hashing a ReadableStream

```typescript
import { MD5ReadableStream } from 'pure-md5';

const source = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('Hello World'));
    controller.close();
  }
});

const result = await MD5ReadableStream.hash(source);
console.log('MD5:', result.digest);
console.log('Bytes:', result.bytesProcessed);
```

### Hashing a File (Browser)

```typescript
import { hashFile } from 'pure-md5';

const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files![0];
  const result = await hashFile(file);
  console.log('MD5:', result.digest);
});
```

### Hashing a Blob

```typescript
import { hashBlob } from 'pure-md5';

const canvas = document.querySelector('canvas');
canvas.toBlob(async (blob) => {
  const result = await hashBlob(blob!);
  console.log('MD5:', result.digest);
});
```

### Using MD5ReadableStream directly

```typescript
import { MD5ReadableStream, createMD5ReadableStream } from 'pure-md5';

// Using static hash method
const source = new ReadableStream({ ... });
const result = await MD5ReadableStream.hash(source);

// Using factory function
const stream = createMD5ReadableStream(source);
// Get reader to consume the stream
const reader = stream.getReader();
// MD5 result available via getResult()
const result = await stream.getResult();
```

### Processing with a reader

```typescript
const source = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('test'));
    controller.close();
  }
});

const stream = new MD5ReadableStream(source);
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunks as they come
}

// Get MD5 result after consuming stream
const result = await stream.getResult();
```

## Options

All functions support an optional `MD5ReadableStreamOptions` parameter:

```typescript
interface MD5ReadableStreamOptions {
  add32?: (x: number, y: number) => number; // Custom add32 function for testing
}
```

Example with custom add32:

```typescript
const customAdd32 = (x: number, y: number) => (x + y) & 0xffffffff;
const result = await hashFile(file, { add32: customAdd32 });
```

## API Reference

### MD5ReadableStream

#### Constructor
```typescript
new MD5ReadableStream(source: ReadableStream, options?: MD5ReadableStreamOptions)
```

#### Methods

- `getReader(): ReadableStreamDefaultReader<Uint8Array>` - Get a reader for the stream
- `getResult(): Promise<MD5Result>` - Get the MD5 result
- `getCurrentState(): { state: number[]; bytesProcessed: number }` - Get current internal state (for debugging)
- `getBytesProcessed(): number` - Get total bytes processed

#### Static Methods

- `hash(source: ReadableStream, options?: MD5ReadableStreamOptions): Promise<MD5Result>` - Hash a stream directly

### Factory Functions

- `createMD5ReadableStream(source: ReadableStream, options?: MD5ReadableStreamOptions): MD5ReadableStream`

### Hash Functions

- `hashFile(file: File, options?: MD5ReadableStreamOptions): Promise<MD5Result>` - Hash a File
- `hashBlob(blob: Blob, options?: MD5ReadableStreamOptions): Promise<MD5Result>` - Hash a Blob

### Result Type

```typescript
interface MD5Result {
  digest: string;       // MD5 hash as hex string (32 characters)
  bytesProcessed: number; // Total bytes processed
}
```

## Browser Compatibility

Requires modern browsers with WHATWG Streams support:
- Chrome 52+
- Firefox 57+
- Safari 12.1+
- Edge 79+

For older browsers, consider using a [ReadableStream polyfill](https://github.com/whatwg/streams).

## Example: Upload Progress with MD5

```typescript
import { MD5ReadableStream } from 'pure-md5';

async function uploadWithHash(file: File): Promise<void> {
  // Get file stream
  const fileStream = file.stream();
  
  // Create MD5 stream
  const md5Stream = new MD5ReadableStream(fileStream);
  
  // Get reader for progress tracking
  const reader = md5Stream.getReader();
  let bytesProcessed = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    bytesProcessed += value.length;
    const progress = (bytesProcessed / file.size * 100).toFixed(1);
    console.log(`Upload progress: ${progress}%`);
  }
  
  // Get MD5 hash
  const result = await md5Stream.getResult();
  console.log('Upload complete. MD5:', result.digest);
}
```

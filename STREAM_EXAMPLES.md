# MD5 Streaming API - Usage Examples

This document provides practical examples for using the MD5 streaming API in various scenarios.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [File Operations](#file-operations)
3. [Browser Usage](#browser-usage)
4. [Advanced Scenarios](#advanced-scenarios)
5. [Integration Examples](#integration-examples)

---

## Basic Usage

### Hash a String

```typescript
import { MD5Stream } from 'pure-md5';

const stream = new MD5Stream();
let digest = '';

stream.on('md5', (result) => {
  digest = result.digest;
});

stream.end('Hello, World!');
console.log(digest); // 65a8e27d8879283831b664bd8b7f0ad4
```

### Hash a Buffer

```typescript
import { MD5Stream } from 'pure-md5';

const data = Buffer.from('Hello, World!', 'utf8');
const stream = new MD5Stream();
let digest = '';

stream.on('md5', (result) => {
  digest = result.digest;
});

stream.end(data);
console.log(digest); // 65a8e27d8879283831b664bd8b7f0ad4
```

### Using fromStream (Promise-based)

```typescript
import { fromStream } from 'pure-md5';
import { Readable } from 'stream';

const source = Readable.from(['Hello', ' ', 'World!']);
const { result } = fromStream(source);

result.then(({ digest, bytesProcessed }) => {
  console.log('MD5:', digest);
  console.log('Bytes:', bytesProcessed);
});
```

### Using pipeThroughMD5

```typescript
import { pipeThroughMD5 } from 'pure-md5';
import { Readable } from 'stream';

const source = Readable.from(['Hello', ' ', 'World!']);
const { digest, bytesProcessed } = await pipeThroughMD5(source);

console.log('MD5:', digest);
console.log('Bytes:', bytesProcessed);
```

---

## File Operations

### Hash a File

```typescript
import { hashFile } from 'pure-md5';

const result = await hashFile('path/to/file.txt');
console.log('MD5:', result.digest);
console.log('Bytes:', result.bytesProcessed);
```

### Hash Multiple Files

```typescript
import { hashFile } from 'pure-md5';

async function hashFiles(files: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const file of files) {
    const result = await hashFile(file);
    results.set(file, result.digest);
  }
  
  return results;
}

const fileHashes = await hashFiles(['file1.txt', 'file2.txt', 'file3.txt']);
fileHashes.forEach((hash, file) => console.log(`${file}: ${hash}`));
```

### Hash Files Concurrently

```typescript
import { hashFile } from 'pure-md5';

async function hashFilesConcurrently(files: string[], maxConcurrent = 4): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const queue = [...files];
  
  async function processNext() {
    if (queue.length === 0) return;
    const file = queue.shift();
    const result = await hashFile(file!);
    results.set(file!, result.digest);
    await processNext();
  }
  
  const workers = Array.from({ length: Math.min(maxConcurrent, files.length) }, processNext);
  await Promise.all(workers);
  
  return results;
}
```

### Hash File with Progress

```typescript
import { MD5Stream } from 'pure-md5';
import fs from 'fs';

async function hashFileWithProgress(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    const stream = new MD5Stream();
    let processed = 0;
    
    stream.on('md5', (result) => {
      console.log('\nComplete!');
      console.log('MD5:', result.digest);
      resolve(result.digest);
    });
    
    stream.on('data', (chunk) => {
      processed += chunk.length;
      const progress = ((processed / fileSize) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${progress}%`);
    });
    
    fs.createReadStream(filePath).pipe(stream);
  });
}

await hashFileWithProgress('large-file.bin');
```

### Verify File Integrity

```typescript
import { verifyFile } from 'pure-md5';

async function verifyDownload(filePath: string, expectedHash: string): Promise<void> {
  const isVerified = await verifyFile(filePath, expectedHash);
  
  if (isVerified) {
    console.log('✓ File verified successfully!');
  } else {
    console.log('✗ File verification failed!');
    throw new Error('File integrity check failed');
  }
}

await verifyDownload('downloaded-file.zip', '5d41402abc4b2a76b9719d911017c592');
```

---

## Browser Usage

### Hash a File Upload

```typescript
import { hashFile } from 'pure-md5';

async function handleFileUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files![0];
  
  const result = await hashFile(file);
  console.log('File MD5:', result.digest);
  
  // Upload with hash...
}

document.querySelector('input[type="file"]').addEventListener('change', handleFileUpload);
```

### Hash Blob from Canvas

```typescript
import { hashBlob } from 'pure-md5';

async function hashCanvas(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      
      const result = await hashBlob(blob);
      resolve(result.digest);
    }, 'image/png');
  });
}

const digest = await hashCanvas(document.querySelector('canvas'));
console.log('Canvas MD5:', digest);
```

### Stream File with Progress

```typescript
import { MD5ReadableStream } from 'pure-md5';

async function uploadWithHash(file: File, uploadUrl: string): Promise<void> {
  const fileStream = file.stream();
  const md5Stream = new MD5ReadableStream(fileStream);
  
  const reader = md5Stream.getReader();
  let bytesProcessed = 0;
  
  // Consume stream and track progress
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    bytesProcessed += value.length;
    const progress = (bytesProcessed / file.size * 100).toFixed(1);
    console.log(`Upload progress: ${progress}%`);
  }
  
  const result = await md5Stream.getResult();
  console.log('Upload complete. MD5:', result.digest);
  
  // Now upload with hash metadata
  // await fetch(uploadUrl, { method: 'POST', body: file, headers: { 'X-MD5': result.digest } });
}
```

---

## Advanced Scenarios

### Custom add32 Function

```typescript
import { MD5Stream } from 'pure-md5';

// For testing - use a known add32 implementation
const customAdd32 = (x: number, y: number): number => {
  // Custom implementation for compatibility testing
  const result = x + y;
  return (result & 0xffffffff) >>> 0;
};

const stream = new MD5Stream({ add32: customAdd32 });
let digest = '';

stream.on('md5', (result) => {
  digest = result.digest;
});

stream.end('test with custom add32');
console.log(digest);
```

### Stream with Timeout

```typescript
import { MD5Stream } from 'pure-md5';

async function hashWithTimeout(source: NodeJS.ReadableStream, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Hashing timeout'));
    }, timeoutMs);
    
    const stream = new MD5Stream();
    
    stream.on('md5', (result) => {
      clearTimeout(timeout);
      resolve(result.digest);
    });
    
    stream.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    source.pipe(stream);
  });
}

try {
  const digest = await hashWithTimeout(fs.createReadStream('file.txt'), 5000);
  console.log('MD5:', digest);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Multiple Hashes in Parallel

```typescript
import { hashFile } from 'pure-md5';

interface HashResult {
  file: string;
  digest: string;
  size: number;
}

async function hashFilesParallel(files: string[]): Promise<HashResult[]> {
  const promises = files.map(async (file) => {
    const result = await hashFile(file);
    const size = (await fs.promises.stat(file)).size;
    return { file, digest: result.digest, size };
  });
  
  return Promise.all(promises);
}

const results = await hashFilesParallel(['file1.txt', 'file2.txt', 'file3.txt']);
results.forEach(r => console.log(`${r.file}: ${r.digest} (${r.size} bytes)`));
```

### Detect File Changes

```typescript
import { hashFile } from 'pure-md5';

interface FileHash {
  path: string;
  hash: string;
  timestamp: number;
}

async function detectChanges(previous: Map<string, FileHash>, currentFiles: string[]): Promise<void> {
  const changes: string[] = [];
  
  // Check existing files
  for (const file of currentFiles) {
    const currentHash = await hashFile(file);
    const previousHash = previous.get(file);
    
    if (!previousHash || previousHash.hash !== currentHash.digest) {
      changes.push(file);
    }
  }
  
  // Check for deleted files
  for (const [file] of previous) {
    if (!currentFiles.includes(file)) {
      changes.push(file);
    }
  }
  
  if (changes.length > 0) {
    console.log('Changed files:', changes);
  }
}
```

---

## Integration Examples

### Express.js Middleware

```typescript
import { hashFile } from 'pure-md5';
import express, { Request, Response, NextFunction } from 'express';

interface RequestWithHash extends Request {
  fileHash?: string;
}

const app = express();

// Middleware to compute file hash
app.use((req: RequestWithHash, res: Response, next: NextFunction) => {
  if (req.body && req.body.file) {
    hashFile(req.body.file.path)
      .then(result => {
        req.fileHash = result.digest;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

app.post('/upload', (req: RequestWithHash, res: Response) => {
  res.json({
    hash: req.fileHash,
    message: 'File uploaded'
  });
});
```

### AWS Lambda Function

```typescript
import { hashFile } from 'pure-md5';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export async function handler(event: any): Promise<any> {
  const bucket = event.bucket;
  const key = event.key;
  
  // Get object from S3
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);
  
  // Hash the content
  const content = await response.Body!.transformToString();
  const hash = await hashFile(content);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      md5: hash.digest,
      size: hash.bytesProcessed
    })
  };
}
```

### GraphQL Resolver

```typescript
import { hashFile } from 'pure-md5';

const resolvers = {
  Query: {
    fileHash: async (_, { path }: { path: string }) => {
      const result = await hashFile(path);
      return {
        digest: result.digest,
        bytesProcessed: result.bytesProcessed,
        path
      };
    }
  }
};
```

### CLI Tool

```typescript
#!/usr/bin/env node
import { hashFile } from 'pure-md5';
import fs from 'fs';

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: md5-hash <file>');
    process.exit(1);
  }
  
  try {
    const result = await hashFile(filePath);
    console.log(result.digest);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

### React Component

```typescript
import { useState, useEffect } from 'react';
import { hashFile } from 'pure-md5';

function FileHasher() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  useEffect(() => {
    if (file) {
      setLoading(true);
      hashFile(file)
        .then(result => {
          setHash(result.digest);
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [file]);
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {loading && <p>Computing hash...</p>}
      {hash && <p>MD5: {hash}</p>}
    </div>
  );
}
```

### Node.js CLI Tool with Progress

```typescript
#!/usr/bin/env node
import { MD5Stream } from 'pure-md5';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: md5-hash <file>');
  process.exit(1);
}

const fileSize = fs.statSync(filePath).size;
const stream = new MD5Stream();
let processed = 0;

const updateProgress = () => {
  const progress = ((processed / fileSize) * 100).toFixed(1);
  process.stdout.write(`\r${progress}% [${'#'.padEnd(50, ' ').substring(0, Math.floor(progress / 2))}]`);
};

stream.on('data', (chunk) => {
  processed += chunk.length;
  if (processed % (64 * 1024) === 0) { // Update every 64KB
    updateProgress();
  }
});

stream.on('md5', (result) => {
  updateProgress();
  console.log(`\n${result.digest}  ${filePath}`);
  rl.close();
});

stream.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  rl.close();
  process.exit(1);
});

fs.createReadStream(filePath).pipe(stream);
```

---

## Performance Examples

### Optimal File Hashing

```typescript
import { MD5Stream } from 'pure-md5';
import fs from 'fs';

async function optimalHashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = new MD5Stream();
    
    stream.on('md5', (result) => {
      resolve(result.digest);
    });
    
    stream.on('error', reject);
    
    // Use piping for optimal performance
    fs.createReadStream(filePath).pipe(stream);
  });
}
```

### Memory-Efficient Large File Processing

```typescript
import { MD5Stream } from 'pure-md5';

async function hashLargeFileEfficiently(source: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = new MD5Stream();
    
    stream.on('md5', (result) => {
      resolve(result.digest);
    });
    
    stream.on('error', reject);
    
    // Set optimal buffer size
    source.setEncoding('binary');
    source.pipe(stream);
  });
}
```

### Batch Processing

```typescript
import { hashFile } from 'pure-md5';

async function batchHashFiles(
  files: string[],
  batchSize: number = 10
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(f => hashFile(f)));
    
    batch.forEach((file, index) => {
      results.set(file, batchResults[index].digest);
    });
  }
  
  return results;
}
```

## See Also

- [STREAM_API.md](STREAM_API.md) - Complete API documentation
- [MIGRATION_GUIDE_STREAMS.md](MIGRATION_GUIDE_STREAMS.md) - Migration examples
- [STREAM_TROUBLESHOOTING.md](STREAM_TROUBLESHOOTING.md) - Common issues
- [STREAM_BENCHMARKS.md](STREAM_BENCHMARKS.md) - Performance benchmarks

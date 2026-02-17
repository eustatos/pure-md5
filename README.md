# pure-md5 🎯

**A lightweight, zero-dependency JavaScript library for MD5 hashing with streaming support for large files.**

[![npm version](https://img.shields.io/npm/v/pure-md5.svg?style=flat&color=informational)](https://npmjs.org/package/pure-md5)
[![npm downloads](https://img.shields.io/npm/dm/pure-md5.svg?style=flat&color=blue)](https://npmjs.org/package/pure-md5)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/eustatos/pure-md5/npm-publish.yml?branch=main&style=flat&logo=github)](https://github.com/eustatos/pure-md5/actions/workflows/npm-publish.yml)
[![codecov](https://img.shields.io/codecov/c/github/eustatos/pure-md5/main?style=flat&logo=codecov)](https://codecov.io/gh/eustatos/pure-md5)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/pure-md5?style=flat&color=success&label=.bundle%20size)](https://bundlephobia.com/result?p=pure-md5)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

### Install

```bash
npm install pure-md5
# or
yarn add pure-md5
# or
pnpm add pure-md5
```

### Basic Usage

```javascript
import { md5 } from 'pure-md5';

const hash = md5('hello');
console.log(hash); // "5d41402abc4b2a76b9719d911017c592"
```

### Streaming (Large Files)

```javascript
import { createMD5Stream } from 'pure-md5';
import fs from 'fs';

const stream = createMD5Stream();
stream.on('md5', result => console.log('MD5:', result.digest));

fs.createReadStream('large-file.bin').pipe(stream);
```

---

## ✨ Features

- ⚡ **Zero Dependencies** - No external dependencies, ever
- 📦 **Tiny Bundle** - < 1KB gzipped
- 🎯 **Multiple APIs** - Simple, streaming, and promise-based
- 🦺 **TypeScript Ready** - Full type definitions included
- 🔌 **Adapter System** - Automatic detection (WebCrypto, Node.js, Pure JS)
- 📄 **File Hashing** - Stream large files with progress tracking
- 🌐 **Universal** - Works in Node.js and browsers

---

## 📚 Documentation

- [API Reference](#-api-reference)
- [Streaming API](STREAM_API.md)
- [Streaming Examples](STREAM_EXAMPLES.md)
- [Migration Guide](MIGRATION_GUIDE_STREAMS.md)
- [Troubleshooting](STREAM_TROUBLESHOOTING.md)
- [Benchmarks](STREAM_BENCHMARKS.md)
- [Contributing](#-contributing)

---

## 🛠️ API Reference

### Basic MD5

#### `md5(message[, encoding])`

Compute MD5 hash of a string or buffer.

```javascript
import { md5 } from 'pure-md5';

// String input
md5('hello'); // "5d41402abc4b2a76b9719d911017c592"

// Buffer input
md5(Buffer.from('hello')); // "5d41402abc4b2a76b9719d911017c592"

// Custom encoding
md5('hello', 'hex'); // "5d41402abc4b2a76b9719d911017c592"
```

### Streaming API

#### `createMD5Stream()`

Create a new MD5Stream instance.

```javascript
import { createMD5Stream } from 'pure-md5';

const stream = createMD5Stream();
stream.on('md5', result => {
  console.log('MD5:', result.digest);      // "5d41402abc4b2a76b9719d911017c592"
  console.log('Bytes:', result.bytesProcessed); // 5
});
```

#### `pipeThroughMD5(source)`

Pipe a stream through MD5 hashing and get a promise.

```javascript
import { pipeThroughMD5, fromReadable } from 'pure-md5';

const source = fromReadable(['hello', ' ', 'world']);
const result = await pipeThroughMD5(source);
console.log('MD5:', result.digest);
```

#### `fromStream(stream)`

Convenience method to create a stream and get result.

```javascript
import { fromStream } from 'pure-md5';
import fs from 'fs';

const { stream, result } = fromStream(fs.createReadStream('file.txt'));
result.then(r => console.log('MD5:', r.digest));
```

### File System Utilities

#### `hashFile(filePath, options?)`

Hash a file asynchronously.

```javascript
import { hashFile } from 'pure-md5';

const result = await hashFile('path/to/file.txt');
console.log('MD5:', result.digest);
console.log('Bytes:', result.bytesProcessed);

// With progress tracking
const progress = createProgressTracker(result.bytesProcessed, percent => {
  console.log(`Progress: ${percent.toFixed(1)}%`);
});

const result = await hashFile('large-file.bin', { onProgress: progress });
```

#### `hashFileDigest(filePath)`

Hash a file and return only the digest.

```javascript
import { hashFileDigest } from 'pure-md5';

const digest = await hashFileDigest('path/to/file.txt');
console.log('MD5:', digest);
```

#### `hashFileSync(filePath)`

Hash a file synchronously (for small files).

```javascript
import { hashFileSync } from 'pure-md5';

const digest = hashFileSync('small-file.txt');
console.log('MD5:', digest);
```

#### `verifyFile(filePath, expectedDigest)`

Verify file integrity using MD5.

```javascript
import { verifyFile } from 'pure-md5';

const isVerified = await verifyFile('path/to/file.txt', '5d41402abc4b2a76b9719d911017c592');
console.log('Verified:', isVerified); // true or false
```

### CDN Usage

```html
<script src="https://unpkg.com/pure-md5@latest/dist/index.js"></script>
<script>
  console.log(md5('hello')); // "5d41402abc4b2a76b9719d911017c592"
</script>
```

---

## 📊 Comparison with Alternatives

| Feature | pure-md5 | crypto-js | js-md4 | Node.js crypto |
|---------|----------|-----------|--------|----------------|
| Bundle Size | <1KB | ~4KB | ~2KB | N/A |
| Dependencies | 0 | 0 | 0 | 0 |
| Streaming | ✅ | ❌ | ❌ | ✅ |
| Browser Support | ✅ | ✅ | ✅ | ❌ |
| TypeScript | ✅ | ❌ | ⚠️ | ❌ |
| Zero Config | ✅ | ✅ | ❌ | ✅ |

---

## 🔧 Configuration

### Node.js

```javascript
// Node.js adapter is auto-detected
import { md5 } from 'pure-md5';
```

### Browser

```javascript
// WebCrypto adapter is auto-detected
import { md5 } from 'pure-md5';
```

### Manual Adapter Selection

```javascript
import { md5 } from 'pure-md5/adapters/node';
// or
import { md5 } from 'pure-md5/adapters/webcrypto';
// or
import { md5 } from 'pure-md5/adapters/pure-js';
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Setup

```bash
git clone https://github.com/eustatos/pure-md5.git
cd pure-md5
npm install
npm test
```

### Running Tests

```bash
npm test                  # Run all tests
npm run coverage          # Generate coverage report
npm run build:watch       # Build in watch mode
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 💙 Support This Project

If you find this project helpful, please consider supporting it:

- ⭐ Star this repository
- 🐦 Tweet about it
- 💬 Share with your community
- 🍺 Buy me a coffee (coming soon)

---

## 📚 Related Resources

- [MD5 on Wikipedia](https://en.wikipedia.org/wiki/MD5)
- [RFC 1321 - The MD5 Message-Digest Algorithm](https://www.ietf.org/rfc/rfc1321.txt)
- [Node.js crypto documentation](https://nodejs.org/api/crypto.html)

---

*Made with ❤️ by [Aleksandr Astashkin](https://github.com/eustatos)

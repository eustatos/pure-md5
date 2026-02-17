/**
 * MD5 Stream API - Streaming MD5 hash computation
 * Provides Transform stream and factory functions for efficient MD5 hashing
 * Supports both Node.js Streams and WHATWG Streams for browsers
 */

import { MD5Stream as MD5StreamClass, createMD5Stream, pipeThroughMD5, MD5Result, fromStream } from './md5-stream.js';

// Add fromStream as static method to MD5Stream class
Object.defineProperty(MD5StreamClass, 'fromStream', {
  value: fromStream,
  writable: false,
  configurable: false
});

export { MD5StreamClass as MD5Stream, createMD5Stream, pipeThroughMD5, MD5Result, fromStream };

export {
  hashFile,
  hashFileStream,
  hashFileDigest,
  hashFileStreamDigest,
  hashFileSync,
  verifyFile,
  createProgressTracker,
  HashFileOptions
} from './fs-utils.js';

// WHATWG Streams support for browsers
export {
  MD5ReadableStream,
  createMD5ReadableStream,
  hashReadableStream,
  hashFile as hashFileWHATWG,
  hashBlob,
  consumeWithMD5,
  MD5ReadableStreamOptions
} from './whatwg-stream.js';

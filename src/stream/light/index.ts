/**
 * Pure MD5 Stream (Light) - Tree-shakeable streaming MD5 hash computation
 * Minimal stream-only implementation without detection overhead
 * Perfect for bundlers that support tree-shaking
 */

export { MD5Stream, createMD5Stream, pipeThroughMD5, MD5Result, fromStream } from '../md5-stream.js';

export {
  hashFile,
  hashFileStream,
  hashFileDigest,
  hashFileStreamDigest,
  hashFileSync,
  verifyFile,
  createProgressTracker,
  HashFileOptions
} from '../fs-utils.js';

// WHATWG Streams support for browsers
export {
  MD5ReadableStream,
  createMD5ReadableStream,
  hashReadableStream,
  hashFile as hashFileWHATWG,
  hashBlob,
  consumeWithMD5,
  MD5ReadableStreamOptions
} from '../whatwg-stream.js';

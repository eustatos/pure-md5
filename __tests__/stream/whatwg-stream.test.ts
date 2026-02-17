/**
 * WHATWG Streams tests for browser environments
 * These tests verify the WHATWG Streams implementation works correctly
 */

import { MD5ReadableStream, hashBlob } from '../../src/stream/whatwg-stream.js';
import { md5Core } from '../../src/core/index.js';

// Mock FileReader for Node.js environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).FileReader = class {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
  
  _result: ArrayBuffer | string | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((buffer) => {
      this._result = buffer;
      this.onload?.({
        target: {
          result: buffer
        }
      });
    }).catch((error) => {
      this.onerror?.({ error });
    });
  }
};

describe('MD5ReadableStream', () => {
  test('should compute MD5 hash for empty stream', async () => {
    const source = new ReadableStream({
      start(controller) {
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(''));
    expect(result.bytesProcessed).toBe(0);
  }, 10000);

  test('should compute MD5 hash for simple string', async () => {
    const input = 'hello';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should compute MD5 hash for longer string', async () => {
    const input = 'a'.repeat(1000);
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should process chunked data correctly', async () => {
    const input = 'hello world';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('hello '));
        controller.enqueue(new TextEncoder().encode('world'));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should handle multiple chunks of varying sizes', async () => {
    const input = 'This is a test string with multiple chunks';
    const chunks = ['This ', 'is a', ' test', ' string', ' with', ' multi', 'ple c', 'hunks'];
    
    const source = new ReadableStream({
      start(controller) {
        chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk)));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should handle data that exactly fills 64-byte blocks', async () => {
    const input = 'a'.repeat(64);
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should handle data that is multiple of 64 bytes', async () => {
    const input = 'a'.repeat(128);
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should handle special characters', async () => {
    const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should emit bytesProcessed correctly', async () => {
    const totalBytes = 256;
    const chunkSize = 64;
    
    const source = new ReadableStream({
      start(controller) {
        const chunk = new TextEncoder().encode('a'.repeat(chunkSize));
        for (let i = 0; i < 4; i++) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.bytesProcessed).toBe(totalBytes);
    expect(result.digest.length).toBe(32);
  }, 10000);

  test('should support custom add32 function', async () => {
    const input = 'custom add32 test';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const customAdd32 = (x: number, y: number) => (x + y) & 0xffffffff;
    const result = await MD5ReadableStream.hash(source, { add32: customAdd32 });
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should handle sequential processing', async () => {
    const parts = ['Hello, ', 'World!', ' This is ', 'MD5 streaming.'];
    const full = parts.join('');
    
    const source = new ReadableStream({
      start(controller) {
        parts.forEach(part => controller.enqueue(new TextEncoder().encode(part)));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(full));
    expect(result.bytesProcessed).toBe(full.length);
  }, 10000);

  test('should handle single byte chunks', async () => {
    const input = 'a';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should emit valid hex digest', async () => {
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('test'));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    // MD5 digest should be 32 hex characters
    expect(result.digest).toMatch(/^[0-9a-f]{32}$/);
    expect(result.digest.length).toBe(32);
  }, 10000);

  test('should get current state during processing', async () => {
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('test'));
        controller.close();
      }
    });

    const stream = new MD5ReadableStream(source);
    
    // Check initial state before reading
    const initialState = stream.getCurrentState();
    expect(initialState.state).toHaveLength(4);
    expect(initialState.bytesProcessed).toBe(0);
    
    // Read some data
    const reader = stream.getReader();
    await reader.read();
    
    // Check state after reading
    const afterDataState = stream.getCurrentState();
    expect(afterDataState.bytesProcessed).toBe(4);
    
    // Check bytes processed getter
    expect(stream.getBytesProcessed()).toBe(4);
  }, 10000);

  test('should handle empty chunks', async () => {
    const input = 'test';
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(''));
        controller.enqueue(new TextEncoder().encode(input));
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);
});

describe('hashBlob', () => {
  test('should hash a Blob', async () => {
    const input = 'blob hash test';
    const blob = new Blob([input]);
    
    const result = await hashBlob(blob);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  }, 10000);

  test('should hash an empty Blob', async () => {
    const blob = new Blob([]);
    
    const result = await hashBlob(blob);
    
    expect(result.digest).toBe(md5Core(''));
    expect(result.bytesProcessed).toBe(0);
  }, 10000);
});

describe('integration', () => {
  test('should handle large data correctly', async () => {
    const chunkSize = 1024 * 1024; // 1MB
    const numChunks = 3;
    const totalBytes = chunkSize * numChunks;
    
    const source = new ReadableStream({
      start(controller) {
        const chunk = new TextEncoder().encode('a'.repeat(chunkSize));
        for (let i = 0; i < numChunks; i++) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });

    const result = await MD5ReadableStream.hash(source);
    
    // We're just testing that it processes the data without crashing
    // The actual hash doesn't matter for this test
    expect(result.bytesProcessed).toBe(totalBytes);
    expect(result.digest.length).toBe(32); // MD5 is 32 hex chars
  }, 10000);
});

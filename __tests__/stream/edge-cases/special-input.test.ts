/**
 * Edge case tests for MD5Stream: empty input, special characters, unicode, binary data
 */

import { describe, it, expect } from 'vitest';
import { MD5Stream } from '../../../src/stream/md5-stream.js';
import { md5Core } from '../../../src/core/index.js';

function getResult(stream: MD5Stream): Promise<any> {
  return new Promise((resolve, reject) => {
    stream.on('md5', resolve).on('error', reject);
  });
}

describe('MD5Stream - Edge Cases', () => {
  it('should handle empty stream', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.end('');
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(''));
    expect(result.bytesProcessed).toBe(0);
  });

  it('should handle single byte', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.end('a');
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core('a'));
    expect(result.bytesProcessed).toBe(1);
  });

  it('should handle exactly 64 bytes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(64);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(64);
  });

  it('should handle 65 bytes (one over block size)', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(65);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(65);
  });

  it('should handle multiple of 64 bytes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(256);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(256);
  });

  it('should handle very large input', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(1000000);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  it('should handle binary data with null bytes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe, 0xfd]);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest.length).toBe(32);
    expect(result.bytesProcessed).toBe(7);
  });

  it('should handle unicode characters', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'Привет мир 你好 🌍';
    stream.end(input);
    const result = await resultPromise;
    // MD5 of UTF-8 bytes
    expect(result.bytesProcessed).toBe(Buffer.byteLength(input, 'utf8'));
    expect(result.digest.length).toBe(32);
  });

  it('should handle special characters', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
  });

  it('should handle newline characters', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'line1\nline2\r\nline3';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
  });

  it('should handle tab characters', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'col1\tcol2\tcol3';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
  });

  it('should handle whitespace only', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = '   \t\n  ';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
  });

  it('should handle null bytes in string', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a\0b\0c\0d';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  it('should handle emoji', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = '😀😃😄😁';
    stream.end(input);
    const result = await resultPromise;
    expect(result.bytesProcessed).toBe(Buffer.byteLength(input, 'utf8'));
    expect(result.digest.length).toBe(32);
  });

  it('should handle mixed scripts', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'Hello Привет 你好 مرحبا';
    stream.end(input);
    const result = await resultPromise;
    expect(result.bytesProcessed).toBe(Buffer.byteLength(input, 'utf8'));
    expect(result.digest.length).toBe(32);
  });

  it('should handle control characters', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = '\x00\x01\x02\x03\x04\x05';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest.length).toBe(32);
    expect(result.bytesProcessed).toBe(6);
  });

  it('should handle high unicode', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = '\u{1F600}\u{1F601}\u{1F602}';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest.length).toBe(32);
  });
});

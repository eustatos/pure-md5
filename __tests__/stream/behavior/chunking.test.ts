/**
 * Tests for MD5Stream chunking behavior and performance
 */

import { describe, it, expect } from 'vitest';
import { MD5Stream } from '../../../src/stream/md5-stream.js';
import { md5Core } from '../../../src/core/index.js';

function getResult(stream: MD5Stream): Promise<any> {
  return new Promise((resolve, reject) => {
    stream.on('md5', resolve).on('error', reject);
  });
}

describe('MD5Stream - Chunking Behavior', () => {
  it('should handle many small chunks', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'hello world';
    for (const char of input) {
      stream.write(char);
    }
    stream.end();
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  it('should handle chunked writes with varying sizes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const chunks = ['a', 'bb', 'ccc', 'dddd', 'eeeee'];
    chunks.forEach(chunk => stream.write(chunk));
    stream.end();
    const result = await resultPromise;
    const combined = chunks.join('');
    expect(result.digest).toBe(md5Core(combined));
    expect(result.bytesProcessed).toBe(combined.length);
  });

  it('should handle interleaved write and end', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.write('first');
    stream.write('second');
    stream.end('third');
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core('firstsecondthird'));
  });

  it('should process 64-byte aligned chunks efficiently', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.write('a'.repeat(64));
    stream.write('b'.repeat(64));
    stream.end();
    const result = await resultPromise;
    expect(result.bytesProcessed).toBe(128);
  });

  it('should handle partial blocks correctly', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.write('a'.repeat(30));
    stream.write('b'.repeat(30));
    stream.end();
    const result = await resultPromise;
    expect(result.bytesProcessed).toBe(60);
  });

  it('should handle single byte chunks', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'hello';
    for (const char of input) {
      stream.write(char);
    }
    stream.end();
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });
});

describe('MD5Stream - Custom Options', () => {
  it('should work with custom add32 function', async () => {
    const customAdd32 = (x: number, y: number): number => {
      return ((x + y) & 0xffffffff);
    };

    const stream = new MD5Stream({ add32: customAdd32 });
    const input = 'custom add32 test string';
    const resultPromise = getResult(stream);
    stream.end(input);
    const result = await resultPromise;

    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });
});

describe('MD5Stream - Performance', () => {
  it('should process 1MB in reasonable time', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const data = 'a'.repeat(1024 * 1024);
    const start = Date.now();
    stream.end(data);
    const result = await resultPromise;
    const duration = Date.now() - start;

    expect(result.bytesProcessed).toBe(data.length);
    expect(duration).toBeLessThan(5000);
  }, 10000);

  it('should handle concurrent streams', async () => {
    const streams = Array.from({ length: 5 }, () => {
      const stream = new MD5Stream();
      const resultPromise = getResult(stream);
      stream.end(`test-${Math.random()}`);
      return resultPromise;
    });

    const results = await Promise.all(streams);
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result.digest.length).toBe(32);
    });
  });

  it('should handle 10MB stream', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const data = 'a'.repeat(10 * 1024 * 1024);
    stream.end(data);
    const result = await resultPromise;

    expect(result.bytesProcessed).toBe(data.length);
    expect(result.digest.length).toBe(32);
  }, 15000);
});

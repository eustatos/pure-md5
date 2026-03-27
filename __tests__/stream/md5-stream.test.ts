import { MD5Stream, createMD5Stream, MD5Result } from '../../src/stream/md5-stream.js';
import { md5Core } from '../../src/core/index.js';

/**
 * Helper to promisify MD5Stream result
 */
function getResult(stream: MD5Stream): Promise<MD5Result> {
  return new Promise((resolve, reject) => {
    stream.on('md5', resolve).on('error', reject);
  });
}

describe('MD5Stream', () => {
  test('should compute MD5 hash for empty string', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    stream.end('');
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(''));
    expect(result.bytesProcessed).toBe(0);
  });

  test('should compute MD5 hash for simple string', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'hello';
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should compute MD5 hash for longer string', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(1000);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should process chunked data correctly', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'hello world';
    stream.write('hello ');
    stream.write('world');
    stream.end();
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle multiple chunks of varying sizes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'This is a test string with multiple chunks';
    const chunks = ['This ', 'is a', ' test', ' string', ' with', ' multi', 'ple c', 'hunks'];
    chunks.forEach(chunk => stream.write(chunk));
    stream.end();
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle data that exactly fills 64-byte blocks', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(64);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle data that is multiple of 64 bytes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(128);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle data with remainder bytes', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(70);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle single byte chunks', async () => {
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

  test('should handle large input', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const input = 'a'.repeat(100000);
    stream.end(input);
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle binary data', async () => {
    const stream = new MD5Stream();
    const resultPromise = getResult(stream);
    const data = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe, 0xfd]);
    stream.end(data);
    const result = await resultPromise;
    const expected = md5Core(data.toString('binary'));
    expect(result.digest).toBe(expected);
    expect(result.bytesProcessed).toBe(data.length);
  });

  test('should handle destroyed stream', () => {
    const stream = new MD5Stream();
    stream.destroy();
    expect(stream.destroyed).toBe(true);
  });

  test('should allow reset after computation', async () => {
    const stream = new MD5Stream();

    // First computation
    stream.write('first');
    const result1Promise = getResult(stream);
    stream.end();
    const result1 = await result1Promise;
    expect(result1.digest).toBe(md5Core('first'));

    // Reset creates new internal state
    stream.reset();
    expect(stream.getBytesProcessed()).toBe(0);
  });

  test('should track bytes processed', async () => {
    const stream = new MD5Stream();
    stream.write('hello');
    expect(stream.getBytesProcessed()).toBe(5);
    stream.write(' world');
    expect(stream.getBytesProcessed()).toBe(11);
    stream.end();
    await new Promise(resolve => stream.on('finish', resolve));
  });

  test('should provide current state', async () => {
    const stream = new MD5Stream();
    stream.write('test');
    const state = stream.getCurrentState();
    expect(state.state).toHaveLength(4);
    expect(state.bytesProcessed).toBe(4);
    stream.end();
    await new Promise(resolve => stream.on('finish', resolve));
  });

  test('createMD5Stream factory should work', async () => {
    const stream = createMD5Stream();
    const resultPromise = getResult(stream);
    stream.end('test');
    const result = await resultPromise;
    expect(result.digest).toBe(md5Core('test'));
  });
});

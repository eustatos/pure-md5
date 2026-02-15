import { MD5Stream, createMD5Stream } from '../../src/stream/md5-stream.js';
import { md5Core } from '../../src/core/index.js';

describe('MD5Stream', () => {
  test('should compute MD5 hash for empty string', (done) => {
    const stream = new MD5Stream();
    const chunks: string[] = [];
    
    stream.on('data', (chunk) => chunks.push(chunk.toString()));
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(''));
      expect(result.bytesProcessed).toBe(0);
      done();
    });
    
    stream.end('');
  });

  test('should compute MD5 hash for simple string', (done) => {
    const stream = new MD5Stream();
    const input = 'hello';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should compute MD5 hash for longer string', (done) => {
    const stream = new MD5Stream();
    const input = 'a'.repeat(1000);
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should process chunked data correctly', (done) => {
    const stream = new MD5Stream();
    const input = 'hello world';
    const chunk1 = 'hello ';
    const chunk2 = 'world';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.write(chunk1);
    stream.write(chunk2);
    stream.end();
  });

  test('should handle multiple chunks of varying sizes', (done) => {
    const stream = new MD5Stream();
    const input = 'This is a test string with multiple chunks';
    const chunks = ['This ', 'is a', ' test', ' string', ' with', ' multi', 'ple c', 'hunks'];
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    chunks.forEach(chunk => stream.write(chunk));
    stream.end();
  });

  test('should handle data that exactly fills 64-byte blocks', (done) => {
    const stream = new MD5Stream();
    const input = 'a'.repeat(64);
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should handle data that is multiple of 64 bytes', (done) => {
    const stream = new MD5Stream();
    const input = 'a'.repeat(128);
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should handle special characters', (done) => {
    const stream = new MD5Stream();
    const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should emit bytesProcessed correctly', (done) => {
    const stream = new MD5Stream();
    const totalBytes = 256;
    
    stream.on('md5', (result) => {
      expect(result.bytesProcessed).toBe(totalBytes);
      done();
    });
    
    // Write data in 64-byte chunks
    const chunk = 'a'.repeat(64);
    for (let i = 0; i < 4; i++) {
      stream.write(chunk);
    }
    stream.end();
  });

  test('should handle binary buffer input', (done) => {
    const stream = new MD5Stream();
    const input = Buffer.from('test buffer');
    
    stream.on('md5', (result) => {
      // MD5 of string 'test buffer'
      expect(result.digest).toBe(md5Core('test buffer'));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should handle large file simulation', (done) => {
    const stream = new MD5Stream();
    const chunkSize = 1024 * 1024; // 1MB
    const numChunks = 3;
    const totalBytes = chunkSize * numChunks;
    
    stream.on('md5', (result) => {
      // We're just testing that it processes the data without crashing
      // The actual hash doesn't matter for this test
      expect(result.bytesProcessed).toBe(totalBytes);
      expect(result.digest.length).toBe(32); // MD5 is 32 hex chars
      done();
    });
    
    const chunk = Buffer.alloc(chunkSize, 'a');
    for (let i = 0; i < numChunks; i++) {
      stream.write(chunk);
    }
    stream.end();
  });

  test('should support factory function createMD5Stream', (done) => {
    const stream = createMD5Stream();
    const input = 'factory test';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should support custom add32 function', (done) => {
    const customAdd32 = (x: number, y: number) => (x + y) & 0xffffffff;
    const stream = new MD5Stream({ add32: customAdd32 });
    const input = 'custom add32 test';
    
    stream.on('md5', (result) => {
      // Should produce the same result as md5Core with default add32
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.end(input);
  });

  test('should handle sequential processing', (done) => {
    const stream = new MD5Stream();
    const parts = ['Hello, ', 'World!', ' This is ', 'MD5 streaming.'];
    const full = parts.join('');
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(full));
      expect(result.bytesProcessed).toBe(full.length);
      done();
    });
    
    parts.forEach(part => stream.write(part));
    stream.end();
  });

  test('should handle single byte chunks', (done) => {
    const stream = new MD5Stream();
    const input = 'a';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.write('a');
    stream.end();
  });

  test('should emit valid hex digest', (done) => {
    const stream = new MD5Stream();
    
    stream.on('md5', (result) => {
      // MD5 digest should be 32 hex characters
      expect(result.digest).toMatch(/^[0-9a-f]{32}$/);
      expect(result.digest.length).toBe(32);
      done();
    });
    
    stream.end('test');
  });

  test('should reset state properly', (done) => {
    const stream = new MD5Stream();
    let firstResult: any = null;
    
    // First computation
    stream.on('md5', (result: any) => {
      firstResult = result;
      
      // Destroy and recreate the stream
      stream.destroy();
      const newStream = new MD5Stream();
      
      newStream.on('md5', (secondResult: any) => {
        // Results should be different
        expect(firstResult.digest).not.toBe(secondResult.digest);
        expect(firstResult.bytesProcessed).toBe(5); // 'first'.length
        expect(secondResult.bytesProcessed).toBe(6); // 'second'.length
        done();
      });
      
      newStream.write('second');
      newStream.end();
    });
    
    stream.write('first');
    stream.end();
  });

  test('should get current state during processing', () => {
    const stream = new MD5Stream();
    
    // Check initial state
    const initialState = stream.getCurrentState();
    expect(initialState.state).toHaveLength(4);
    expect(initialState.bytesProcessed).toBe(0);
    
    // Process some data
    stream.write('test');
    
    const afterDataState = stream.getCurrentState();
    expect(afterDataState.bytesProcessed).toBe(4);
    
    // Check bytes processed getter
    expect(stream.getBytesProcessed()).toBe(4);
  });

  test('should handle empty chunks', (done) => {
    const stream = new MD5Stream();
    const input = 'test';
    
    stream.on('md5', (result) => {
      expect(result.digest).toBe(md5Core(input));
      expect(result.bytesProcessed).toBe(input.length);
      done();
    });
    
    stream.write('');
    stream.write('test');
    stream.end();
  });
});

import { Readable } from 'stream';

describe('pipeThroughMD5 and fromStream', () => {
  test('should support pipeThroughMD5 method', async () => {
    const { pipeThroughMD5 } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const stream = new MD5Stream();
    const input = 'pipe through test';
    const source = Readable.from([input]);
    
    const result = await pipeThroughMD5.call(stream, source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should support fromStream static method', async () => {
    const { fromStream } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const input = 'from stream test';
    const source = Readable.from([input]);
    
    const { stream, result } = fromStream(source);
    
    expect(stream).toBeInstanceOf(MD5Stream);
    
    const resultData = await result;
    expect(resultData.digest).toBe(md5Core(input));
    expect(resultData.bytesProcessed).toBe(input.length);
  });

  test('should support fromStream with options', async () => {
    const { fromStream } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const input = 'from stream with options test';
    const source = Readable.from([input]);
    const customAdd32 = (x: number, y: number) => (x + y) & 0xffffffff;
    
    const { result } = fromStream(source, { add32: customAdd32 });
    
    const resultData = await result;
    expect(resultData.digest).toBe(md5Core(input));
    expect(resultData.bytesProcessed).toBe(input.length);
  });

  test('should handle empty stream with pipeThroughMD5', async () => {
    const { pipeThroughMD5 } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const stream = new MD5Stream();
    const source = Readable.from([]);
    
    const result = await pipeThroughMD5.call(stream, source);
    
    expect(result.digest).toBe(md5Core(''));
    expect(result.bytesProcessed).toBe(0);
  });

  test('should handle large data with pipeThroughMD5', async () => {
    const { pipeThroughMD5 } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const stream = new MD5Stream();
    const input = 'a'.repeat(10000);
    const source = Readable.from([input]);
    
    const result = await pipeThroughMD5.call(stream, source);
    
    expect(result.digest).toBe(md5Core(input));
    expect(result.bytesProcessed).toBe(input.length);
  });

  test('should handle chunked data with fromStream', async () => {
    const { fromStream } = await import('../../src/stream/md5-stream.js');
    const { md5Core } = await import('../../src/core/index.js');
    
    const input = 'chunked data test';
    const chunks = ['chunked ', 'data ', 'test'];
    const source = Readable.from(chunks);
    
    const { result } = fromStream(source);
    
    const resultData = await result;
    expect(resultData.digest).toBe(md5Core(input));
    expect(resultData.bytesProcessed).toBe(input.length);
  });
});

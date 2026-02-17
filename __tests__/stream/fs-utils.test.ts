/**
 * Tests for file system utilities (fs-utils)
 */

import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import {
  hashFile,
  hashFileStream,
  hashFileSync,
  verifyFile,
  createProgressTracker
} from '../../src/stream/fs-utils.js';
import { md5Core } from '../../src/core/index.js';

describe('File System Utilities', () => {
  const fixturesDir = path.join(__dirname, '..', 'integration', 'fixtures');
  const testFile = path.join(fixturesDir, 'test-file.txt');
  const nonExistentFile = path.join(fixturesDir, 'non-existent.txt');

  describe('hashFile', () => {
    test('should hash a text file correctly', async () => {
      const result = await hashFile(testFile);
      
      expect(result.digest).toBe(md5Core('Hello, World!\n'));
      expect(result.bytesProcessed).toBe(14);
      expect(typeof result.digest).toBe('string');
      expect(result.digest.length).toBe(32);
    });

    test('should hash a binary file correctly', async () => {
      const tempFile = path.join(fixturesDir, 'temp-binary.bin');
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
      
      try {
        fs.writeFileSync(tempFile, buffer);
        const result = await hashFile(tempFile);
        
        expect(/^[0-9a-f]{32}$/.test(result.digest)).toBe(true);
        expect(result.bytesProcessed).toBe(6);
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    test('should handle large files', async () => {
      const tempFile = path.join(fixturesDir, 'temp-large.bin');
      const bufferSize = 1024 * 1024;
      const buffer = Buffer.alloc(bufferSize, 'a');
      
      try {
        fs.writeFileSync(tempFile, buffer);
        const result = await hashFile(tempFile);
        
        expect(result.bytesProcessed).toBe(bufferSize);
        expect(result.digest.length).toBe(32);
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    test('should throw error for non-existent file', async () => {
      await expect(hashFile(nonExistentFile)).rejects.toThrow('File not found');
    });

    test('should throw error for directory instead of file', async () => {
      await expect(hashFile(fixturesDir)).rejects.toThrow('Path is not a file');
    });

    test('should support chunkSize option', async () => {
      const result = await hashFile(testFile, { chunkSize: 1024 });
      expect(result.digest).toBe(md5Core('Hello, World!\n'));
    });

    test('should support onProgress option', async () => {
      const progressValues: number[] = [];
      const result = await hashFile(testFile, {
        onProgress: (current) => {
          progressValues.push(current);
        }
      });
      
      expect(result.digest).toBe(md5Core('Hello, World!\n'));
      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBe(14);
    });
  });

  describe('hashFileStream', () => {
    test('should hash a readable stream correctly', async () => {
      const stream = fs.createReadStream(testFile);
      const result = await hashFileStream(stream);
      
      expect(result.digest).toBe(md5Core('Hello, World!\n'));
      expect(result.bytesProcessed).toBe(14);
    });

    test('should handle buffer input through stream', async () => {
      const buffer = Buffer.from('stream test data');
      const stream = Readable.from([buffer]);
      const result = await hashFileStream(stream);
      
      expect(result.digest).toBe(md5Core('stream test data'));
      expect(result.bytesProcessed).toBe(16);
    });

    test('should handle empty stream', async () => {
      const stream = Readable.from([]);
      const result = await hashFileStream(stream);
      
      expect(result.digest).toBe(md5Core(''));
      expect(result.bytesProcessed).toBe(0);
    });

    test('should throw error for invalid stream', async () => {
      await expect(hashFileStream(null as any)).rejects.toThrow('Invalid readable stream');
    });
  });

  describe('hashFileSync', () => {
    test('should hash a text file synchronously', () => {
      const digest = hashFileSync(testFile);
      
      expect(typeof digest).toBe('string');
      expect(digest.length).toBe(32);
      expect(digest).toBe(md5Core('Hello, World!\n'));
    });

    test('should hash a binary file synchronously', () => {
      const tempFile = path.join(fixturesDir, 'temp-sync.bin');
      const buffer = Buffer.from([0x10, 0x20, 0x30]);
      
      try {
        fs.writeFileSync(tempFile, buffer);
        const digest = hashFileSync(tempFile);
        
        expect(/^[0-9a-f]{32}$/.test(digest)).toBe(true);
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    test('should throw error for non-existent file', () => {
      expect(() => hashFileSync(nonExistentFile)).toThrow('File not found');
    });

    test('should throw error for directory', () => {
      expect(() => hashFileSync(fixturesDir)).toThrow('Path is not a file');
    });
  });

  describe('verifyFile', () => {
    test('should verify correct digest', async () => {
      const digest = md5Core('Hello, World!\n');
      const result = await verifyFile(testFile, digest);
      
      expect(result).toBe(true);
    });

    test('should reject incorrect digest', async () => {
      const result = await verifyFile(testFile, 'invalid digest');
      
      expect(result).toBe(false);
    });

    test('should be case-insensitive for digest', async () => {
      const digest = md5Core('Hello, World!\n').toUpperCase();
      const result = await verifyFile(testFile, digest);
      
      expect(result).toBe(true);
    });
  });

  describe('createProgressTracker', () => {
    test('should create a progress callback', () => {
      const progressValues: number[] = [];
      const tracker = createProgressTracker(100, (percent) => {
        progressValues.push(percent);
      });
      
      tracker(25);
      tracker(50);
      tracker(75);
      tracker(100);
      
      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });
  });

  describe('integration with MD5Stream', () => {
    test('should produce same hash as MD5Stream', async () => {
      const stream = fs.createReadStream(testFile);
      const { MD5Stream, pipeThroughMD5 } = require('../../src/stream/md5-stream.js');
      const md5Stream = new MD5Stream();
      const streamResult = await pipeThroughMD5.call(md5Stream, stream);
      const fileResult = await hashFile(testFile);
      
      expect(streamResult.digest).toBe(fileResult.digest);
    });
  });
});

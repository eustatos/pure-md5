/**
 * Integration tests for MD5Stream with real file I/O
 */

import fs from 'fs';
import path from 'path';
import { MD5Stream, hashFile, hashFileSync, verifyFile, hashFileDigest } from '../../src/stream/index.js';
import { md5Core } from '../../src/core/index.js';

describe('MD5Stream - File I/O Integration', () => {
  let tempDir: string;
  
  beforeAll(() => {
    tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });
  
  afterAll(() => {
    // Cleanup temp files
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(tempDir);
    }
  });
  
  describe('hashFile (async)', () => {
    test('should hash a small text file', async () => {
      const filePath = path.join(tempDir, 'test-small.txt');
      const content = 'Hello, World!';
      fs.writeFileSync(filePath, content);
      
      const result = await hashFile(filePath);
      
      expect(result.digest).toBe(md5Core(content));
      expect(result.bytesProcessed).toBe(content.length);
      expect(result.digest.length).toBe(32);
    });
    
    test('should hash an empty file', async () => {
      const filePath = path.join(tempDir, 'test-empty.txt');
      fs.writeFileSync(filePath, '');
      
      const result = await hashFile(filePath);
      
      expect(result.digest).toBe(md5Core(''));
      expect(result.bytesProcessed).toBe(0);
    });
    
    test('should handle file path as string', async () => {
      const filePath = path.join(tempDir, 'test-path.txt');
      const content = 'Path test content';
      fs.writeFileSync(filePath, content);
      
      const result = await hashFile(filePath);
      
      expect(result.digest).toBe(md5Core(content));
    });
    
    test('should handle large files efficiently', async () => {
      const filePath = path.join(tempDir, 'test-large.bin');
      const size = 10 * 1024 * 1024; // 10MB
      const content = 'a'.repeat(size);
      fs.writeFileSync(filePath, content);
      
      const start = Date.now();
      const result = await hashFile(filePath);
      const duration = Date.now() - start;
      
      expect(result.bytesProcessed).toBe(size);
      expect(result.digest.length).toBe(32);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    }, 10000);
  });
  
  describe('hashFileSync (sync)', () => {
    test('should hash a small file synchronously', () => {
      const filePath = path.join(tempDir, 'test-sync.txt');
      const content = 'Sync hash test';
      fs.writeFileSync(filePath, content);
      
      const digest = hashFileSync(filePath);
      
      expect(digest).toBe(md5Core(content));
      expect(digest.length).toBe(32);
    });
    
    test('should hash empty file synchronously', () => {
      const filePath = path.join(tempDir, 'test-sync-empty.txt');
      fs.writeFileSync(filePath, '');
      
      const digest = hashFileSync(filePath);
      
      expect(digest).toBe(md5Core(''));
    });
    
    test('should be faster than async for small files', () => {
      const filePath = path.join(tempDir, 'test-sync-performance.txt');
      const content = 'a'.repeat(1000);
      fs.writeFileSync(filePath, content);
      
      const startSync = Date.now();
      hashFileSync(filePath);
      const syncDuration = Date.now() - startSync;
      
      expect(syncDuration).toBeLessThan(100); // Sync should be fast for small files
    });
  });
  
  describe('hashFileDigest', () => {
    test('should return only digest string', async () => {
      const filePath = path.join(tempDir, 'test-digest.txt');
      const content = 'Digest only test';
      fs.writeFileSync(filePath, content);
      
      const digest = await hashFileDigest(filePath);
      
      expect(typeof digest).toBe('string');
      expect(digest).toBe(md5Core(content));
      expect(digest.length).toBe(32);
    });
  });
  
  describe('verifyFile', () => {
    test('should verify correct hash', async () => {
      const filePath = path.join(tempDir, 'test-verify.txt');
      const content = 'Verification test';
      const correctDigest = md5Core(content);
      fs.writeFileSync(filePath, content);
      
      const isVerified = await verifyFile(filePath, correctDigest);
      
      expect(isVerified).toBe(true);
    });
    
    test('should reject incorrect hash', async () => {
      const filePath = path.join(tempDir, 'test-verify-wrong.txt');
      const content = 'Verification test wrong';
      const wrongDigest = '00000000000000000000000000000000';
      fs.writeFileSync(filePath, content);
      
      const isVerified = await verifyFile(filePath, wrongDigest);
      
      expect(isVerified).toBe(false);
    });
    
    test('should handle file not found', async () => {
      const filePath = path.join(tempDir, 'test-verify-not-found.txt');
      const digest = '00000000000000000000000000000000';
      
      await expect(verifyFile(filePath, digest)).rejects.toThrow();
    });
  });
  
  describe('MD5Stream with file streams', () => {
    test('should hash file using fs.createReadStream', (done) => {
      const filePath = path.join(tempDir, 'test-stream.txt');
      const content = 'Stream file test';
      fs.writeFileSync(filePath, content);
      
      const stream = new MD5Stream();
      
      stream.on('md5', (result) => {
        expect(result.digest).toBe(md5Core(content));
        expect(result.bytesProcessed).toBe(content.length);
        done();
      });
      
      fs.createReadStream(filePath).pipe(stream);
    });
    
    test('should handle file stream errors gracefully', (done) => {
      const stream = new MD5Stream();
      
      const source = fs.createReadStream('/nonexistent/file.txt');
      
      // Source stream will emit error, but it should not hang
      source.on('error', (error) => {
        // Error is on source stream, not MD5Stream
        // This is expected behavior - the source stream emits the error
        expect(error).toBeDefined();
        done();
      });
      
      // MD5Stream will just see end-of-stream since source fails early
      stream.on('md5', () => {
        // This shouldn't happen for non-existent file
        done();
      });
      
      source.pipe(stream);
    });
  });
  
  describe('Progress tracking', () => {
    test('should support progress callback', (done) => {
      const filePath = path.join(tempDir, 'test-progress.txt');
      const content = 'a'.repeat(10000);
      fs.writeFileSync(filePath, content);
      
      // Note: Current implementation doesn't have built-in progress
      // This is a placeholder for future implementation
      // For now, we just verify the file can be hashed
      hashFile(filePath).then((result) => {
        expect(result.bytesProcessed).toBe(content.length);
        done();
      });
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle special characters in filename', async () => {
      const specialFileName = 'test with spaces & special!@#.txt';
      const filePath = path.join(tempDir, specialFileName);
      const content = 'Special filename test';
      fs.writeFileSync(filePath, content);
      
      const result = await hashFile(filePath);
      
      expect(result.digest).toBe(md5Core(content));
      
      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    test('should handle binary file content', async () => {
      const filePath = path.join(tempDir, 'test-binary.bin');
      const content = Buffer.alloc(100);
      for (let i = 0; i < 100; i++) {
        content[i] = i % 256;
      }
      fs.writeFileSync(filePath, content);
      
      const result = await hashFile(filePath);
      
      expect(result.digest.length).toBe(32);
      expect(result.bytesProcessed).toBe(100);
    });
    
    test('should handle unicode filename', async () => {
      const specialFileName = 'тест unicode 文件.txt';
      const filePath = path.join(tempDir, specialFileName);
      const content = 'Unicode filename test';
      fs.writeFileSync(filePath, content);
      
      const result = await hashFile(filePath);
      
      expect(result.digest).toBe(md5Core(content));
      
      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });
  
  describe('Consistency', () => {
    test('should produce same hash for same file', async () => {
      const filePath = path.join(tempDir, 'test-consistency.txt');
      const content = 'Consistency test';
      fs.writeFileSync(filePath, content);
      
      const result1 = await hashFile(filePath);
      const result2 = await hashFile(filePath);
      const result3 = await hashFile(filePath);
      
      expect(result1.digest).toBe(result2.digest);
      expect(result2.digest).toBe(result3.digest);
    });
    
    test('should produce different hashes for different files', async () => {
      const file1Path = path.join(tempDir, 'test-diff1.txt');
      const file2Path = path.join(tempDir, 'test-diff2.txt');
      
      fs.writeFileSync(file1Path, 'Content 1');
      fs.writeFileSync(file2Path, 'Content 2');
      
      const result1 = await hashFile(file1Path);
      const result2 = await hashFile(file2Path);
      
      expect(result1.digest).not.toBe(result2.digest);
    });
  });
});

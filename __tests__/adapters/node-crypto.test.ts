/**
 * Tests for Node.js Crypto Backend
 */

import { NodeCryptoBackend } from '../../src/adapters/node.js';

describe('NodeCryptoBackend', () => {
  let backend: NodeCryptoBackend;
  
  beforeAll(() => {
    if (!NodeCryptoBackend.isAvailable()) {
      console.log('Node.js Crypto not available, skipping tests');
      pending('Node.js Crypto not available');
      return;
    }
    backend = new NodeCryptoBackend();
  });
  
  describe('Basic hashing', () => {
    it('should hash string correctly', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const result = await backend.hash('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty string', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const result = await backend.hash('');
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
    
    it('should hash special characters', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const result = await backend.hash('!@#$%^&*()');
      expect(result).toBe('05b28d17a7b6e7024b6e5d8cc43a8bf7');
    });
    
    it('should hash unicode characters', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const result = await backend.hash('Привет мир');
      expect(result).toBe('79d636ccef972a9d10db69750cd53e8b');
    });
    
    it('should hash long string', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const longString = 'a'.repeat(10000);
      const result = await backend.hash(longString);
      expect(result.length).toBe(32);
    });
  });
  
  describe('Binary data', () => {
    it('should hash Uint8Array', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const data = new Uint8Array([104, 101, 108, 108, 111]);
      const result = await backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash ArrayBuffer', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const data = new TextEncoder().encode('hello').buffer;
      const result = await backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty Uint8Array', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const data = new Uint8Array(0);
      const result = await backend.hashBinary(data);
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
  });
  
  describe('Availability', () => {
    it('should be available in Node.js', () => {
      const available = NodeCryptoBackend.isAvailable();
      expect(available).toBe(true);
    });
  });
  
  describe('Performance', () => {
    it('should hash 1MB data efficiently', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const data = 'a'.repeat(1024 * 1024);
      
      const start = Date.now();
      const result = await backend.hash(data);
      const duration = Date.now() - start;
      
      expect(result.length).toBe(32);
      expect(duration).toBeLessThan(500);
    });
  });
  
  describe('Consistency', () => {
    it('should produce same hash for same input', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const input = 'test input';
      const result1 = await backend.hash(input);
      const result2 = await backend.hash(input);
      expect(result1).toBe(result2);
    });
    
    it('should produce different hash for different inputs', async () => {
      if (!backend) {
        pending('Node.js Crypto not available');
        return;
      }
      
      const result1 = await backend.hash('hello');
      const result2 = await backend.hash('world');
      expect(result1).not.toBe(result2);
    });
  });
  
  describe('Interface compliance', () => {
    it('should have correct name and version', () => {
      expect(backend.name).toBe('nodecrypto');
      expect(backend.version).toBe('1.0.0');
    });
    
    it('should have reset method', () => {
      expect(typeof backend.reset).toBe('function');
    });
  });
});

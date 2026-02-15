/**
 * Integration tests for Web Crypto Backend
 */

import { md5, md5Adapter, getAllAvailableBackends } from '../../src/index';

describe('WebCrypto Backend Integration', () => {
  describe('md5 function', () => {
    it('should use default backend correctly', async () => {
      const result = await md5('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should handle empty string', async () => {
      const result = await md5('');
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
    
    it('should handle unicode', async () => {
      const result = await md5('Привет мир');
      expect(result).toBe('5abca3326cf0cefc00efe7065b5e0cf6');
    });
  });
  
  describe('Backend availability', () => {
    it('should detect available backends', async () => {
      const available = await getAllAvailableBackends();
      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);
    });
    
    it('should use md5Adapter with webcrypto', async () => {
      // Check if WebCrypto is available
      const webcryptoAvailable = (md5Adapter as any).createBackendByName('webcrypto');
      expect(webcryptoAvailable).toBeDefined();
    });
  });
});

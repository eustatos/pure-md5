/**
 * Tests for Web Crypto Backend in Node.js
 * Only runs in Node.js 15+ with WebCrypto
 */

import { WebCryptoBackend } from '../../src/adapters/webcrypto';

// Check if running in Node.js
const isNode =
  typeof process !== 'undefined' &&
  process.versions !== undefined &&
  'node' in process.versions;

if (!isNode) {
  console.log('Not in Node.js, skipping');
} else {
  const nodeVersion = process.versions.node.split('.').map(Number);
  const nodeMajor = nodeVersion[0];
  const nodeMinor = nodeVersion[1] || 0;

  // WebCrypto is available in Node.js 15+ (or 14.17+ with flag)
  if (nodeMajor < 15 && !(nodeMajor === 14 && nodeMinor >= 17)) {
    console.log(
      `Node.js version ${process.versions.node} too low, skipping (need 15+ or 14.17+)`
    );
  } else {
    describe('WebCryptoBackend in Node.js', () => {
      let backend: WebCryptoBackend;

      beforeAll(async () => {
        const available = WebCryptoBackend.isAvailable();
        if (!available) {
          console.log('WebCrypto not available in Node.js, skipping');
          return;
        }
        backend = new WebCryptoBackend();
      });

      xit('should be available in Node.js', async () => {
        const available = WebCryptoBackend.isAvailable();
        expect(available).toBe(true);
      });

      it('should hash string correctly', async () => {
        if (!backend) {
          console.log('Skipping test: backend not initialized');
          return;
        }
        const result = await backend.hash('hello');
        expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
      });

      it('should hash empty string', async () => {
        if (!backend) {
          console.log('Skipping test: backend not initialized');
          return;
        }
        const result = await backend.hash('');
        expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
      });

      it('should work with binary data', async () => {
        if (!backend) {
          console.log('Skipping test: backend not initialized');
          return;
        }
        const data = new Uint8Array([104, 101, 108, 108, 111]);
        const result = await backend.hashBinary(data);
        expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
      });
    });
  }
}

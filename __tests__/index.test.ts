import { md5 } from '../src/index';

describe('md5', () => {
  // Test vectors from RFC 1321
  test('should compute correct MD5 hash for RFC 1321 test vectors', () => {
    // Test 1: empty string
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');

    // Test 2: "a"
    expect(md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661');

    // Test 3: "abc"
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');

    // Test 4: "message digest"
    expect(md5('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0');

    // Test 5: "abcdefghijklmnopqrstuvwxyz"
    expect(md5('abcdefghijklmnopqrstuvwxyz')).toBe(
      'c3fcd3d76192e4007dfb496cca67e13b'
    );

    // Test 6: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    expect(
      md5('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
    ).toBe('d174ab98d277d9f5a5611c2c9f419d9f');

    // Test 7: "12345678901234567890123456789012345678901234567890123456789012345678901234567890"
    expect(
      md5(
        '12345678901234567890123456789012345678901234567890123456789012345678901234567890'
      )
    ).toBe('57edf4a22be3c955ac49da2e2107b67a');
  });

  test('should compute correct MD5 hash for common strings', () => {
    // Test from the code itself
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');

    // Additional common test cases
    expect(md5('Hello, World!')).toBe('65a8e27d8879283831b664bd8b7f0ad4');
    expect(md5('The quick brown fox jumps over the lazy dog')).toBe(
      '9e107d9d372bb6826bd81d3542a419d6'
    );
    expect(md5('The quick brown fox jumps over the lazy dog.')).toBe(
      'e4d909c290d0fb1ca068ffaddf22cbd0'
    );
  });

  test('should handle edge cases', () => {
    // Very long string
    const longString = 'x'.repeat(10000);
    const hash = md5(longString);
    expect(hash).toMatch(/^[0-9a-f]{32}$/);

    // Single character
    expect(md5('x')).toBe('9dd4e461268c8034f5c8564e155c67a6');

    // String with null bytes
    expect(md5('test\0null')).toBe('530923740caad7aad6a2cd4b894d983d');
  });

  test('should produce consistent results', () => {
    const input = 'test string';
    const hash1 = md5(input);
    const hash2 = md5(input);
    const hash3 = md5(input);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
    expect(hash1).toMatch(/^[0-9a-f]{32}$/);
  });

  test('should handle Unicode strings (using UTF-16 code units)', () => {
    // Note: This implementation uses charCodeAt() which returns UTF-16 code units
    // This is different from UTF-8 encoding used by some other MD5 implementations
    expect(md5('🎉')).toBe('4d8f74b49d4c8f7b13d0a1cb7e4de561');
    expect(md5('Привет мир')).toBe('79d636ccef972a9d10db69750cd53e8b'); // "Hello world" in Russian
  });

  test('should verify the built-in check works', () => {
    // The function has a built-in check for 'hello'
    // This ensures the runtime check doesn't break functionality
    const result = md5('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});

import { ff, gg, hh, ii } from '../src/round-functions';
import add32 from '../src/add32';

describe('Round Functions', () => {
  const fn = add32;
  const a = 0x12345678;
  const b = 0x9abcdef0;
  const c = 0xfedcba98;
  const d = 0x76543210;
  const x = 0x13579bdf;
  const s = 7;
  const t = 0x5a827999;

  describe('ff', () => {
    test('should compute F function correctly', () => {
      const result = ff(fn, a, b, c, d, x, s, t);

      // Manually compute expected value
      const f = (b & c) | (~b & d);
      const add = fn;
      let expected = add(a, f);
      expected = add(expected, x);
      expected = add(expected, t);
      expected = add((expected << s) | (expected >>> (32 - s)), b);

      expect(result).toBe(expected);
    });

    test('should handle different inputs', () => {
      const result1 = ff(fn, 0, 0, 0, 0, 0, 0, 0);
      expect(result1).toBe(0);

      const result2 = ff(fn, -1, -1, -1, -1, -1, 1, -1);
      // Result should be a 32-bit integer (can be negative in two's complement)
      expect(result2).toBeGreaterThanOrEqual(-0x80000000);
      expect(result2).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe('gg', () => {
    test('should compute G function correctly', () => {
      const result = gg(fn, a, b, c, d, x, s, t);

      // Manually compute expected value
      const g = (b & d) | (c & ~d);
      const add = fn;
      let expected = add(a, g);
      expected = add(expected, x);
      expected = add(expected, t);
      expected = add((expected << s) | (expected >>> (32 - s)), b);

      expect(result).toBe(expected);
    });
  });

  describe('hh', () => {
    test('should compute H function correctly', () => {
      const result = hh(fn, a, b, c, d, x, s, t);

      // Manually compute expected value
      const h = b ^ c ^ d;
      const add = fn;
      let expected = add(a, h);
      expected = add(expected, x);
      expected = add(expected, t);
      expected = add((expected << s) | (expected >>> (32 - s)), b);

      expect(result).toBe(expected);
    });
  });

  describe('ii', () => {
    test('should compute I function correctly', () => {
      const result = ii(fn, a, b, c, d, x, s, t);

      // Manually compute expected value
      const i = c ^ (b | ~d);
      const add = fn;
      let expected = add(a, i);
      expected = add(expected, x);
      expected = add(expected, t);
      expected = add((expected << s) | (expected >>> (32 - s)), b);

      expect(result).toBe(expected);
    });
  });
});

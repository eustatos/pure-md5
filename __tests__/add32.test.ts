import add32 from '../src/add32';

describe('add32', () => {
  test('should add two numbers and wrap around at 32 bits', () => {
    // Test basic addition
    expect(add32(1, 2)).toBe(3);
    expect(add32(10, 20)).toBe(30);
    expect(add32(100, 200)).toBe(300);
  });

  test('should handle large numbers correctly (32-bit wrap)', () => {
    // 2^32 - 1 = 4294967295
    expect(add32(4294967295, 1)).toBe(0); // Wrap around
    expect(add32(4294967295, 2)).toBe(1);
    expect(add32(4294967290, 10)).toBe(4); // Fixed: 4294967290 + 10 = 4294967300 mod 2^32 = 4
  });

  test("should handle negative numbers in two's complement", () => {
    // In two's complement 32-bit, -1 = 4294967295
    expect(add32(-1, 1)).toBe(0);
    expect(add32(-10, 10)).toBe(0);
    expect(add32(-100, 100)).toBe(0);
  });

  test('should maintain 32-bit integer behavior', () => {
    // Test overflow behavior
    const max32 = 4294967295;
    expect(add32(max32, max32)).toBe(-2); // Fixed: (2^32 - 1) + (2^32 - 1) = 2^33 - 2 = 0x1FFFFFFFE → 0xFFFFFFFE = -2 in two's complement

    // Test that results stay within 32-bit range
    expect(add32(0xffffffff, 0xffffffff)).toBe(-2); // Same as above
  });
});

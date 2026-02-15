import hex from '../src/hex';

describe('hex', () => {
  test('should convert number array to hex string', () => {
    const input = [0x12345678, 0x9abcdef0];
    const expected = '78563412f0debc9a';
    expect(hex(input)).toBe(expected);
  });

  test('should handle empty array', () => {
    expect(hex([])).toBe('');
  });

  test('should handle single number', () => {
    expect(hex([0x00000000])).toBe('00000000');
    expect(hex([0xffffffff])).toBe('ffffffff');
    expect(hex([0x01234567])).toBe('67452301');
  });

  test('should convert large numbers correctly', () => {
    const input = [0xdeadbeef, 0xcafebabe, 0xfaceb00c];
    const expected = 'efbeaddebebafeca0cb0cefa';
    expect(hex(input)).toBe(expected);
  });

  test('should handle boundary values', () => {
    // Minimum
    expect(hex([0])).toBe('00000000');

    // Maximum 32-bit
    expect(hex([4294967295])).toBe('ffffffff');

    // Test with 4 numbers (typical MD5 output)
    expect(hex([1732584193, -271733879, -1732584194, 271733878])).toBe(
      '0123456789abcdeffedcba9876543210'
    );
  });
});

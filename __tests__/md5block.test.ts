import md5blk from '../src/md5blk';

describe('md5blk', () => {
  test('should convert string to 16-word block', () => {
    // Test with a simple string
    const input = 'a'.repeat(64); // 64 characters = 1 full block
    const result = md5blk(input);

    expect(result).toHaveLength(16);

    // The character 'a' has code 97
    // In little-endian, first word should be: 97 + (97 << 8) + (97 << 16) + (97 << 24)
    const expectedFirstWord = 97 + (97 << 8) + (97 << 16) + (97 << 24);
    expect(result[0]).toBe(expectedFirstWord);
  });

  test('should handle empty string', () => {
    const result = md5blk('');
    expect(result).toHaveLength(16);

    // All words should be 0
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBe(0);
    }
  });

  test('should handle partial block', () => {
    // Test with less than 64 characters
    const input = 'hello world';
    const result = md5blk(input);

    expect(result).toHaveLength(16);

    // First word should contain 'h' (104), 'e' (101), 'l' (108), 'l' (108)
    const expectedFirstWord = 104 + (101 << 8) + (108 << 16) + (108 << 24);
    expect(result[0]).toBe(expectedFirstWord);

    // Second word should contain 'o' (111), ' ' (32), 'w' (119), 'o' (111)
    const expectedSecondWord = 111 + (32 << 8) + (119 << 16) + (111 << 24);
    expect(result[1]).toBe(expectedSecondWord);

    // Remaining words should be 0
    for (let i = 2; i < 16; i++) {
      expect(result[i]).toBe(0);
    }
  });

  test('should convert characters correctly', () => {
    const input = 'abcd';
    const result = md5blk(input);

    // 'a'(97), 'b'(98), 'c'(99), 'd'(100)
    const expectedWord = 97 + (98 << 8) + (99 << 16) + (100 << 24);
    expect(result[0]).toBe(expectedWord);

    // Remaining words should be 0
    for (let i = 1; i < 16; i++) {
      expect(result[i]).toBe(0);
    }
  });
});

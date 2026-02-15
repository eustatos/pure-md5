import md5cycle from '../src/md5cycle';

describe('md5cycle', () => {
  test('should update state correctly', () => {
    const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    const block = new Array(16).fill(0);

    // Make a copy for comparison
    const originalState = [...state];

    md5cycle(state, block);

    // After processing, state should be different
    expect(state).not.toEqual(originalState);

    // All elements should be 32-bit integers
    state.forEach((val) => {
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(-0x80000000);
      expect(val).toBeLessThanOrEqual(0xffffffff);
    });
  });

  test('should handle custom add32 functions', () => {
    const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    const block = new Array(16).fill(0x12345678);

    const customAdd32 = jest.fn((x: number, y: number) => (x + y) & 0xffffffff);

    md5cycle(state, block, customAdd32);

    // Custom add32 function should have been called
    expect(customAdd32).toHaveBeenCalled();
  });

  test('should use default add32 when fn is undefined', () => {
    const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    const block = new Array(16).fill(0);

    // Since we can't easily mock the default import in md5cycle,
    // we'll test the behavior by ensuring state changes
    const originalState = [...state];

    md5cycle(state, block);

    expect(state).not.toEqual(originalState);
  });
});

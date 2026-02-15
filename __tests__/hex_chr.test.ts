import hex_chr from '../src/hex_chr';

describe('hex_chr', () => {
  test('should contain all hex digits', () => {
    expect(hex_chr).toBeInstanceOf(Array);
    expect(hex_chr.length).toBe(16);
    
    // Check all hex digits
    const expected = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    expect(hex_chr).toEqual(expected);
  });

  test('should have correct character at each position', () => {
    // Spot check some positions
    expect(hex_chr[0]).toBe('0');
    expect(hex_chr[9]).toBe('9');
    expect(hex_chr[10]).toBe('a');
    expect(hex_chr[15]).toBe('f');
  });
});
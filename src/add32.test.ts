import add32 from './add32';

describe('add32', () => {
  it('', () => {
    const fn = function add32(x, y) {
      let lsw = (x & 0xffff) + (y & 0xffff);
      let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    };
    expect(fn(-2040750029, -271733879)).toBe(1982483388);
  });
  it('add32', () => {
    expect(add32(-2040750029, -271733879)).toBe(1982483388);
  });
});

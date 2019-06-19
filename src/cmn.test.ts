import cmn from './cmn';

describe('cmn', () => {
  it('', () => {
    function add32(a, b) {
      return (a + b) & 0xffffffff;
    }

    function cmn1(q, a, x, t) {
      a = add32(add32(a, q), add32(x, t));
      return a;
    }
    function cmn2(a, s, b) {
      var result = add32((a << s) | (a >>> (32 - s)), b);
      return result;
    }

    var q = -683929777,
      a = 803717621,
      b = -1764103088,
      x = 0,
      s = 15,
      t = -1560198380;

    a = cmn1(q, a, x, t);

    expect(a).toBe(-1440410536);
    expect(cmn2(a, s, b)).toBe(554058082);
  });
  it('natiee', () => {
    var q = -683929777,
      a = 803717621,
      b = -1764103088,
      x = 0,
      s = 15,
      t = -1560198380;
    expect(cmn(q, a, b, x, s, t)).toBe(554058082);
  });
});

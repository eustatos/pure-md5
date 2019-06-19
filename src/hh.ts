import cmn from './cmn';

function hh(
  fn,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
) {
  return cmn(b ^ c ^ d, a, b, x, s, t, fn);
}

export default hh;

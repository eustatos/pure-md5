import cmn from './cmn';

function gg(
  fn,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t, fn);
}

export default gg;

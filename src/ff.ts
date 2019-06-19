import cmn from './cmn';

function ff(
  fn,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
) {
  return cmn((b & c) | (~b & d), a, b, x, s, t, fn);
}

export default ff;

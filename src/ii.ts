import cmn from './cmn';

function ii(
  fn,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
) {
  return cmn(c ^ (b | ~d), a, b, x, s, t, fn);
}

export default ii;

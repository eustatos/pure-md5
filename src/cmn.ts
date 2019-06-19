import add32 from './add32';

function cmn(
  q: number,
  a: number,
  b: number,
  x: number,
  s: number,
  t: number,
  fn?
) {
  a = cmn1(q, a, x, t);
  return cmn2(a, s, b);
}
function cmn1(q: number, a: number, x: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return a;
}
function cmn2(a: number, s: number, b: number) {
  var result = add32((a << s) | (a >>> (32 - s)), b);
  return result;
}

export default cmn;

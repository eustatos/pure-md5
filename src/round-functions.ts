import add32 from './add32';

type Add32Function = (x: number, y: number) => number;

function cmn1(q: number, a: number, x: number, t: number, fn?: Add32Function) {
  const add = fn || add32;
  a = add(add(a, q), add(x, t));
  return a;
}

function cmn2(a: number, s: number, b: number, fn?: Add32Function) {
  const add = fn || add32;
  var result = add((a << s) | (a >>> (32 - s)), b);
  return result;
}

function cmn(
  q: number,
  a: number,
  b: number,
  x: number,
  s: number,
  t: number,
  fn?: Add32Function
) {
  a = cmn1(q, a, x, t, fn);
  return cmn2(a, s, b, fn);
}

export function ff(
  fn: Add32Function,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
): number {
  return cmn((b & c) | (~b & d), a, b, x, s, t, fn);
}

export function gg(
  fn: Add32Function,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
): number {
  return cmn((b & d) | (c & ~d), a, b, x, s, t, fn);
}

export function hh(
  fn: Add32Function,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
): number {
  return cmn(b ^ c ^ d, a, b, x, s, t, fn);
}

export function ii(
  fn: Add32Function,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
): number {
  return cmn(c ^ (b | ~d), a, b, x, s, t, fn);
}

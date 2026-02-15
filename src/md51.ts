import md5cycle from './md5cycle';
import md5blk from './md5blk';

type Add32Function = (x: number, y: number) => number;

function md51(s: string, add32?: Add32Function): number[] {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)), add32);
  }
  s = s.substring(i - 64);
  var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    sl = s.length;
  for (i = 0; i < sl; i++) tail[i >> 2] |= (s.charCodeAt(i) & 0xff) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail, add32);
    i = 16;
    while (i--) {
      tail[i] = 0;
    }
  }
  tail[14] = n * 8;
  md5cycle(state, tail, add32);
  return state;
}

export default md51;

import hex from './hex';
import md51 from './md51';

function md5(string: string): string {
  let fn;
  const check = hex(md51('hello'));
  if (check !== '5d41402abc4b2a76b9719d911017c592') {
    fn = function add32(x, y) {
      let lsw = (x & 0xffff) + (y & 0xffff);
      let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    };
  }

  return hex(md51(string, fn));
}

export default md5;

import hex_chr from './hex_chr';

function rhex(n: number): string {
  let s = '';
  for (let j = 0; j < 4; j++)
    s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
  return s;
}

function hex(x: number[]): string {
  const l = x.length;
  const result: string[] = new Array(l);
  for (let i = 0; i < l; i++) result[i] = rhex(x[i]);
  return result.join('');
}

export default hex;

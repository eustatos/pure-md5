import md5cycle from './md5cycle';
import md5blk from './md5blk';

type Add32Function = (x: number, y: number) => number;

/**
 * Encode string to UTF-8 bytes
 * @param s - Input string
 * @returns Array of UTF-8 bytes
 */
function strToUTF8Bytes(s: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    
    // Handle surrogate pairs for characters outside BMP
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++; // Skip next char (surrogate pair)
      }
    }
    
    if (code <= 0x7f) {
      // 1 byte
      bytes.push(code);
    } else if (code <= 0x7ff) {
      // 2 bytes
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      // 3 bytes
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      // 4 bytes
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/**
 * Convert Uint8Array to number[] for MD5 processing
 * Each 4 bytes become one 32-bit number (little endian)
 * @param bytes - Input Uint8Array
 * @returns Array of 32-bit numbers
 */
function uint8ArrayToNumberArray(bytes: Uint8Array | number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < 16; i++) {
    result[i] =
      bytes[i * 4] +
      (bytes[i * 4 + 1] << 8) +
      (bytes[i * 4 + 2] << 16) +
      (bytes[i * 4 + 3] << 24);
  }
  return result;
}

function md51(s: string, add32?: Add32Function): number[] {
  // Convert string to UTF-8 bytes
  const bytes = strToUTF8Bytes(s);
  const n = bytes.length;
  
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  
  // Process 64-byte blocks
  for (i = 64; i <= n; i += 64) {
    const block = bytes.slice(i - 64, i);
    md5cycle(state, uint8ArrayToNumberArray(block), add32);
  }
  
  // Handle remainder
  const remainder = bytes.slice(i - 64);
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const sl = remainder.length;
  
  for (i = 0; i < sl; i++) {
    tail[i >> 2] |= remainder[i] << ((i % 4) << 3);
  }
  
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

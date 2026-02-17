import md5cycle from './md5cycle';

type Add32Function = (x: number, y: number) => number;

/**
 * Compute MD5 hash of a Buffer
 * @param buffer - Input Buffer to hash
 * @param add32 - Optional custom add32 function
 * @returns MD5 hash as array of numbers
 */
function md5buf(buffer: Buffer, add32?: Add32Function): number[] {
  const length = buffer.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  
  // Process full 64-byte blocks
  let i;
  for (i = 64; i <= length; i += 64) {
    const block = md5blkBuf(buffer, i - 64);
    md5cycle(state, block, add32);
  }
  
  // Handle remaining bytes
  const remaining = length - i + 64;
  const tail: number[] = new Array(16).fill(0);
  
  // Copy remaining bytes from the end of the buffer
  for (let j = 0; j < remaining; j++) {
    tail[j >> 2] |= (buffer[length - remaining + j] & 0xff) << ((j % 4) << 3);
  }
  
  // Append 0x80
  tail[remaining >> 2] |= 0x80 << ((remaining % 4) << 3);
  
  // If not enough space for length, process current block
  if (remaining > 55) {
    md5cycle(state, tail, add32);
    for (let k = 0; k < 16; k++) {
      tail[k] = 0;
    }
  }
  
  // Append length (in bits)
  tail[14] = length * 8;
  tail[15] = 0; // High 32 bits of length (not used for typical files)
  
  // Final MD5 cycle
  md5cycle(state, tail, add32);
  return state;
}

/**
 * Convert a 64-byte slice of buffer to MD5 block format
 * @param buffer - Input buffer
 * @param offset - Offset to start from
 * @returns Array of 16 32-bit words
 */
function md5blkBuf(buffer: Buffer, offset: number): number[] {
  const md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      (buffer[offset + i] || 0) +
      ((buffer[offset + i + 1] || 0) << 8) +
      ((buffer[offset + i + 2] || 0) << 16) +
      ((buffer[offset + i + 3] || 0) << 24);
  }
  return md5blks;
}

export default md5buf;

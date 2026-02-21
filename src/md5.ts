/**
 * Pure MD5 - Minimal entry point for basic MD5 hashing
 * Only includes the md5() function with zero dependencies
 * Perfect for tree-shaking - will only bundle what's needed
 */

import hex from './hex.js';
import md51 from './md51.js';
import add32 from './add32.js';

/**
 * Compute MD5 hash of a string
 * @param data - Input string to hash
 * @returns MD5 hash as hex string (32 characters)
 * 
 * @example
 * ```ts
 * import { md5 } from 'pure-md5/md5';
 * 
 * md5('hello'); // "5d41402abc4b2a76b9719d911017c592"
 * ```
 */
export function md5(data: string): string {
  return hex(md51(data, add32));
}

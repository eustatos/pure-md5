/**
 * Core MD5 implementation - Pure JavaScript
 * No dependencies, no environment detection
 * This is the minimal, tree-shakeable core
 */

import hex from '../hex';
import md51 from '../md51';
import md5buf from '../md5buf';
import add32 from '../add32';

/**
 * Compute MD5 hash of a string
 * @param string - Input string to hash
 * @returns MD5 hash as hex string
 */
export function md5Core(string: string): string {
  // Use the original implementation
  const fn = add32;
  return hex(md51(string, fn));
}

/**
 * Compute MD5 hash of a Buffer
 * @param buffer - Input Buffer to hash
 * @returns MD5 hash as hex string
 */
export function md5Buffer(buffer: Buffer): string {
  const fn = add32;
  return hex(md5buf(buffer, fn));
}

export { md5Core as md5 };
